import Image from "next/image";
import Link from "next/link";
import GiveawayEntryForm from "@/components/GiveawayEntryForm";
import { CupIcon, TicketIcon, TrophyIcon } from "@/components/icons";
import { GIVEAWAY_PRIZES, formatMonth, giveawayDates, giveawayMonth } from "@/lib/giveaway";

/** Homepage giveaway: banner, prizes, how it works, and the free entry form. */
export default function GiveawaySection({ drinkImage }: { drinkImage: string | null }) {
  const month = giveawayMonth();
  const { endsOn, drawnOn } = giveawayDates(month);

  const steps = [
    { Icon: CupIcon, title: "Order online", text: "Check the giveaway box at checkout — or enter for free." },
    { Icon: TicketIcon, title: "Every order = 1 entry", text: "Up to one a day. More entries, more chances." },
    { Icon: TrophyIcon, title: `${GIVEAWAY_PRIZES.length} winners`, text: `Picked ${drawnOn} and emailed their prize.` },
  ];

  return (
    <section id="giveaway" className="scroll-mt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
      <div className="rounded-3xl overflow-hidden bg-blush-soft border border-blush shadow-sm">
        {/* Banner */}
        <div className="relative">
          <Image
            src="/images/about-drinks.png"
            alt="A row of Chismesito Cafe specialty drinks"
            fill
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover object-[center_20%]"
          />
          <div className="absolute inset-0 bg-maroon/75 sm:bg-transparent sm:bg-gradient-to-r sm:from-maroon/90 sm:via-maroon/60 sm:to-maroon/10" />
          <div className="relative flex flex-col justify-center px-6 sm:px-12 py-10 sm:h-80 text-cream max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blush">{formatMonth(month)}</p>
            <h2 className="mt-1 font-display font-bold text-4xl sm:text-6xl leading-none">Monthly Giveaway</h2>
            <p className="mt-3 text-cream/85 sm:text-lg">
              Your next favorite drink could be on us. Order online and you&apos;re entered automatically.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-cream/15 border border-cream/30 px-3 py-1">Enter by {endsOn}</span>
              <span className="rounded-full bg-cream/15 border border-cream/30 px-3 py-1">Winners {drawnOn}</span>
              <span className="rounded-full bg-cream/15 border border-cream/30 px-3 py-1">No purchase necessary</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8">
          <div className="flex flex-col gap-8">
            {/* Prizes */}
            <div className="grid sm:grid-cols-2 gap-4">
              {GIVEAWAY_PRIZES.map((prize, i) => (
                <div key={prize.title} className="rounded-2xl bg-white shadow-sm overflow-hidden">
                  <div className="relative h-40 bg-cream-alt flex items-center justify-center">
                    {prize.kind === "drinks" ? (
                      <Image
                        src={drinkImage ?? "/images/order-drink.png"}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 320px, 100vw"
                        className="object-cover object-[center_30%]"
                      />
                    ) : (
                      <GiftCardArt label={`$${prize.value / 100}`} />
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-rose text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1">
                      Prize {i + 1}
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    <p className="font-display font-bold text-xl text-maroon">{prize.title}</p>
                    <p className="text-sm text-ink/60">{prize.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div className="grid sm:grid-cols-3 gap-5">
              {steps.map(({ Icon, title, text }, i) => (
                <div key={title} className="flex sm:flex-col items-start gap-3">
                  <div className="relative w-12 h-12 shrink-0 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                    <Icon className="w-6 h-6 text-rose" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-maroon text-cream text-[11px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-maroon">{title}</p>
                    <p className="text-sm text-ink/60">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/menu"
                className="rounded-full bg-rose hover:bg-rose-dark text-white font-semibold px-6 py-3 text-sm transition-colors"
              >
                Order Now &amp; Get Entered ›
              </Link>
              <Link href="/giveaway/rules" className="text-sm text-ink/60 underline hover:text-rose">
                Official rules
              </Link>
            </div>
          </div>

          {/* Free entry */}
          <div className="rounded-2xl bg-white shadow-sm p-6">
            <h3 className="font-display font-semibold text-xl text-maroon">Enter for free</h3>
            <p className="mt-1 mb-5 text-sm text-ink/60">No purchase needed — you can enter once a day.</p>
            <GiveawayEntryForm />
          </div>
        </div>
      </div>
    </section>
  );
}

/** A little gift card illustration with the cafe logo. */
function GiftCardArt({ label }: { label: string }) {
  return (
    <div className="relative w-52 h-32 -rotate-6 rounded-2xl bg-gradient-to-br from-rose to-maroon shadow-lg p-4 flex flex-col justify-between text-cream">
      <div className="flex items-center gap-2">
        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-cream/70 bg-cream">
          <Image src="/images/logo.png" alt="" fill sizes="36px" className="object-cover" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-cream/80">Gift Card</span>
      </div>
      <p className="font-display font-bold text-4xl self-end">{label}</p>
      <span className="absolute top-3 right-4 text-cream/60">♡</span>
    </div>
  );
}
