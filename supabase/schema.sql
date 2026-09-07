-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE throughout.
--
-- v2: adds sizes + modifier groups (Toast's real menu has size/milk/hot-iced/
-- flavor/add-on choices, not flat prices). Run this even if you already ran
-- v1 — it upgrades the existing tables in place.

create extension if not exists "pgcrypto";

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  category text not null,
  image_url text,
  badge text,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

-- v2 columns on menu_items: base_price_cents replaces price_cents (only used
-- when the item has no sizes), has_sizes flags whether to look in
-- menu_item_sizes instead, featured drives the homepage trending section.
alter table menu_items add column if not exists base_price_cents integer not null default 0;
alter table menu_items add column if not exists has_sizes boolean not null default false;
alter table menu_items add column if not exists featured boolean not null default false;
alter table menu_items drop column if exists price_cents;

create table if not exists menu_item_sizes (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  label text not null,
  price_cents integer not null,
  sort_order integer not null default 0
);

create table if not exists modifier_groups (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  selection_type text not null check (selection_type in ('single', 'multi')),
  required boolean not null default false,
  max_select integer
);

create table if not exists modifier_options (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references modifier_groups(id) on delete cascade,
  label text not null,
  price_cents integer not null default 0,
  sort_order integer not null default 0
);

create table if not exists menu_item_modifier_groups (
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  modifier_group_id uuid not null references modifier_groups(id) on delete cascade,
  primary key (menu_item_id, modifier_group_id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_phone text,
  payment_method text not null check (payment_method in ('online', 'pickup')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'unpaid')),
  fulfillment_status text not null default 'pending' check (fulfillment_status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  stripe_session_id text,
  total_cents integer not null default 0
);

alter table orders add column if not exists customer_email text;
alter table orders add column if not exists confirmation_email_sent_at timestamptz;
alter table orders add column if not exists staff_notified_at timestamptz;
alter table orders add column if not exists staff_notes text;

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  name_snapshot text not null,
  price_cents_snapshot integer not null,
  quantity integer not null check (quantity > 0)
);

alter table order_items add column if not exists size_label text;
alter table order_items add column if not exists modifiers jsonb not null default '[]'::jsonb;

-- menu_item_id originally had the default NO ACTION on delete, which would
-- block deleting a discontinued menu item if any historical order referenced
-- it. Widen it to SET NULL — order_items already snapshots name/price/size/
-- modifiers, so the historical record stays intact either way.
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'order_items_menu_item_id_fkey'
  ) then
    alter table order_items drop constraint order_items_menu_item_id_fkey;
  end if;
  alter table order_items
    add constraint order_items_menu_item_id_fkey
    foreign key (menu_item_id) references menu_items(id) on delete set null;
end $$;

-- Tracks which months of the $1/item fee have actually been paid, so the
-- billing dashboard can show an outstanding balance instead of a lifetime
-- total that never resets. amount_cents snapshots what was owed at the time
-- it was marked paid, so it doesn't shift if it's looked at again later.
create table if not exists billing_payments (
  month text primary key,
  amount_cents integer not null,
  paid_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists order_items_order_id_idx on order_items (order_id);
create index if not exists menu_item_sizes_menu_item_id_idx on menu_item_sizes (menu_item_id);
create index if not exists modifier_options_group_id_idx on modifier_options (group_id);

-- RLS on, no policies: locks out anon/public access entirely. The app only
-- ever talks to Supabase server-side with the service role key, which
-- bypasses RLS, so this is just defense in depth against a leaked anon key.
alter table menu_items enable row level security;
alter table menu_item_sizes enable row level security;
alter table modifier_groups enable row level security;
alter table modifier_options enable row level security;
alter table menu_item_modifier_groups enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table billing_payments enable row level security;
