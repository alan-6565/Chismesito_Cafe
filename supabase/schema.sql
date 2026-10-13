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
alter table orders add column if not exists ready_email_sent_at timestamptz;
-- Superseded by ready_email_sent_at above (the "ready" email replaced the
-- "complete" email this was tracking) before it ever saw real use.
alter table orders drop column if exists completion_email_sent_at;
alter table orders add column if not exists staff_notified_at timestamptz;
alter table orders add column if not exists staff_notes text;
-- Order-ahead: when the customer wants to pick up. Null means "ASAP".
alter table orders add column if not exists pickup_at timestamptz;

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
alter table order_items add column if not exists notes text;

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

-- Gift cards. kind 'amount' stores balance in cents; kind 'drinks' stores it
-- as a count of free drinks (any size). Codes are stored without dashes.
create table if not exists gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  kind text not null check (kind in ('amount', 'drinks')),
  initial_value integer not null check (initial_value > 0),
  balance integer not null check (balance >= 0),
  recipient_name text,
  recipient_email text,
  note text,
  created_at timestamptz not null default now(),
  emailed_at timestamptz
);

-- Every use of a card. amount is in the card's own units (cents or drinks);
-- positive = used, negative = given back (an abandoned online checkout).
create table if not exists gift_card_redemptions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references gift_cards(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  amount integer not null,
  source text not null check (source in ('online', 'in_store', 'refund')),
  created_at timestamptz not null default now()
);

alter table orders add column if not exists gift_card_id uuid references gift_cards(id) on delete set null;
-- Dollar value the card took off this order (total_cents stays the full price).
alter table orders add column if not exists gift_card_cents integer not null default 0;
-- Same deduction in the card's own units, so it can be given back exactly.
alter table orders add column if not exists gift_card_units integer not null default 0;
alter table orders add column if not exists giveaway_opt_in boolean not null default false;

-- Atomic balance change: returns the new balance, or null if it would go
-- negative — two checkouts racing on one card can't both spend it.
create or replace function adjust_gift_card_balance(card_id uuid, delta integer)
returns integer
language sql
as $$
  update gift_cards
  set balance = balance + delta
  where id = card_id and balance + delta >= 0 and balance + delta <= initial_value
  returning balance;
$$;
revoke execute on function adjust_gift_card_balance(uuid, integer) from public, anon, authenticated;

-- Monthly giveaway. Every order is an entry, capped at one per person (email)
-- per day — and the free form also allows one a day, so anyone can match a
-- daily customer's odds without buying anything.
create table if not exists giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  month text not null, -- "2026-10", Pacific time
  name text not null,
  email text not null,
  email_normalized text not null,
  phone text,
  source text not null check (source in ('order', 'free')),
  order_id uuid references orders(id) on delete set null,
  created_at timestamptz not null default now(),
  prize text,
  gift_card_id uuid references gift_cards(id) on delete set null,
  won_at timestamptz
);
alter table giveaway_entries add column if not exists entry_date date;
update giveaway_entries set entry_date = (created_at at time zone 'America/Los_Angeles')::date where entry_date is null;
alter table giveaway_entries alter column entry_date set not null;
alter table giveaway_entries drop constraint if exists giveaway_entries_month_email_normalized_key;
create unique index if not exists giveaway_entries_day_email_idx on giveaway_entries (entry_date, email_normalized);

create index if not exists gift_card_redemptions_card_idx on gift_card_redemptions (gift_card_id);
create index if not exists giveaway_entries_month_idx on giveaway_entries (month);

alter table gift_cards enable row level security;
alter table gift_card_redemptions enable row level security;
alter table giveaway_entries enable row level security;
