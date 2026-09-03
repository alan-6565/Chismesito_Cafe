import { business } from "@/lib/data";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="font-display font-bold text-3xl text-maroon">Terms of Service</h1>
      <p className="text-xs text-ink/40 mt-2">Last updated {new Date().getFullYear()}</p>

      <div className="mt-8 flex flex-col gap-5 text-sm text-ink/70 leading-relaxed">
        <p>
          By placing an order through this website, you agree to the following. This site is
          operated by {business.name}, located at {business.address}.
        </p>

        <section>
          <h2 className="font-display font-semibold text-maroon text-base mb-1">Ordering</h2>
          <p>
            Orders placed through this site are for pickup at our location during business
            hours. Payment is made in person at the time of pickup unless otherwise noted at
            checkout. Prices, availability, and menu items are subject to change without notice,
            and we&rsquo;ll do our best to keep this site up to date.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-maroon text-base mb-1">
            Order accuracy
          </h2>
          <p>
            We do our best to prepare every order correctly, but if something&rsquo;s wrong with
            your order, let us know when you pick it up so we can make it right.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-maroon text-base mb-1">
            Cancellations
          </h2>
          <p>
            We reserve the right to cancel an order — for example, if an item becomes
            unavailable after you&rsquo;ve ordered it. If that happens, we&rsquo;ll let you know.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-maroon text-base mb-1">Contact</h2>
          <p>
            Questions about an order or these terms? Reach us at{" "}
            <a href={`tel:${business.phone}`} className="text-rose underline">
              {business.phone}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
