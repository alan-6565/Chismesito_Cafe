import type { Metadata } from "next";
import Link from "next/link";
import { business } from "@/lib/data";
import { GIVEAWAY_PRIZES } from "@/lib/giveaway";

export const metadata: Metadata = { title: "Giveaway Official Rules" };

export default function GiveawayRulesPage() {
  const sections: { title: string; body: React.ReactNode }[] = [
    {
      title: "No purchase necessary",
      body: (
        <>
          No purchase or payment of any kind is necessary to enter or win. A purchase does not increase your chances
          of winning. Void where prohibited.
        </>
      ),
    },
    {
      title: "Sponsor",
      body: (
        <>
          The giveaway is run by {business.name}, {business.address} (&ldquo;Sponsor&rdquo;).
        </>
      ),
    },
    {
      title: "Who can enter",
      body: (
        <>
          Open to legal residents of the United States who are 13 or older. Entrants under 18 need a parent or
          guardian&rsquo;s permission. Employees of the Sponsor and their immediate families are not eligible.
        </>
      ),
    },
    {
      title: "Giveaway period",
      body: (
        <>
          Each giveaway runs for one calendar month, from 12:00 AM Pacific Time on the 1st through 11:59 PM Pacific
          Time on the last day of the month.
        </>
      ),
    },
    {
      title: "How to enter",
      body: (
        <>
          There are two ways to enter, and both are equal: (1) fill out the free entry form on the{" "}
          <Link href="/#giveaway" className="underline hover:text-rose">
            giveaway page
          </Link>
          , or (2) check the giveaway box when placing an online order. Each online order or free entry form
          counts as one entry, limited to one entry per person (per email address) per day, whichever way you
          enter. Additional entries on the same day are ignored. You never need to buy anything to get the same
          number of entries as someone who orders.
        </>
      ),
    },
    {
      title: "Prizes",
      body: (
        <>
          Each month, {GIVEAWAY_PRIZES.length} winners are drawn: {GIVEAWAY_PRIZES.map((p) => `one receives ${p.title} (${p.detail.toLowerCase()})`).join(" and ")}. Each
          prize is delivered as a digital gift card code that can be used online at this website or in person at
          the café. Prizes have no cash value, cannot be transferred or exchanged, and no substitution is allowed
          except by the Sponsor.
        </>
      ),
    },
    {
      title: "Drawing and odds",
      body: (
        <>
          Winners are chosen at random from all eligible entries received during that month, on or about the 1st
          of the following month. Each entry is one chance to win. A person can win only one prize per month. Odds
          of winning depend on the number of eligible entries received.
        </>
      ),
    },
    {
      title: "Winner notification",
      body: (
        <>
          Winners are notified by email at the address they entered with. If a winner can&rsquo;t be reached or
          doesn&rsquo;t respond within 30 days, the prize may be forfeited and an alternate winner drawn.
        </>
      ),
    },
    {
      title: "Privacy",
      body: (
        <>
          Information you give us is used only to run this giveaway and contact winners. See our{" "}
          <Link href="/privacy" className="underline hover:text-rose">
            privacy policy
          </Link>
          .
        </>
      ),
    },
    {
      title: "General",
      body: (
        <>
          By entering, you agree to these rules. The Sponsor may disqualify entries made with fake information or by
          automated means, and may change or cancel the giveaway if it can&rsquo;t run as planned. Questions? Call
          us at {business.phone}.
        </>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-14">
      <Link href="/#giveaway" className="text-sm text-rose hover:text-rose-dark">
        ‹ Back to the giveaway
      </Link>
      <h1 className="mt-4 font-display font-bold text-3xl text-maroon">Monthly Giveaway — Official Rules</h1>

      <div className="mt-8 flex flex-col gap-5 text-sm text-ink/70 leading-relaxed">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display font-semibold text-maroon text-base mb-1">{s.title}</h2>
            <p>{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
