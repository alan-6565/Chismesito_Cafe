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
          No purchase or payment of any kind is necessary to enter or win. Void where prohibited.
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
          There are two ways to enter: (1) fill out the free entry form on the{" "}
          <Link href="/#giveaway" className="underline hover:text-rose">
            giveaway page
          </Link>
          , or (2) check the giveaway box when placing an online order. Each person may submit one free entry per
          month using the form. Each paid online order with the giveaway box checked adds one additional entry.
          Entries are tracked by email address.
        </>
      ),
    },
    {
      title: "Prizes",
      body: (
        <>
          Each month, one winner is drawn and receives{" "}
          {GIVEAWAY_PRIZES.map((p) => `${p.title} (${p.detail.toLowerCase()})`).join(" and ")}. The prize is
          delivered as a digital gift card code that can be used online at this website or in person at
          the café. Prizes have no cash value, cannot be transferred or exchanged, and no substitution is allowed
          except by the Sponsor.
        </>
      ),
    },
    {
      title: "Drawing and odds",
      body: (
        <>
          The winner is chosen at random from all eligible entries received during that month, on or about the 1st
          of the following month. Each entry is one chance to win. Odds of winning depend on the number of eligible
          entries received.
        </>
      ),
    },
    {
      title: "Winner notification",
      body: (
        <>
          The winner is notified by email at the address they entered with. If the winner can&rsquo;t be reached or
          doesn&rsquo;t respond within 30 days, the prize may be forfeited and an alternate winner drawn.
        </>
      ),
    },
    {
      title: "Privacy",
      body: (
        <>
          Information you give us is used only to run this giveaway and contact the winner. See our{" "}
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
