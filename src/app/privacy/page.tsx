import { business } from "@/lib/data";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="font-display font-bold text-3xl text-maroon">Privacy Policy</h1>
      <p className="text-xs text-ink/40 mt-2">Last updated {new Date().getFullYear()}</p>

      <div className="mt-8 flex flex-col gap-5 text-sm text-ink/70 leading-relaxed">
        <p>
          {business.name} (&ldquo;we,&rdquo; &ldquo;us&rdquo;) operates this website. This page
          explains what information we collect when you place an order and how it&rsquo;s used.
        </p>

        <section>
          <h2 className="font-display font-semibold text-maroon text-base mb-1">
            What we collect
          </h2>
          <p>
            When you place an order, we collect your name and, if you provide it, a phone
            number, so we know who&rsquo;s picking up an order and can reach you about it. We
            also store the items, sizes, and options you selected so we can prepare your order
            correctly.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-maroon text-base mb-1">
            Payment information
          </h2>
          <p>
            For pickup orders, payment happens in person at the café — we don&rsquo;t collect or
            store any card information through this website. If online payment is added in the
            future, card details will be handled directly by our payment processor and never
            stored on our own servers.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-maroon text-base mb-1">
            How we use it
          </h2>
          <p>
            Order information is used only to prepare and fulfill your order, and to keep
            business records. We don&rsquo;t sell your information or share it with third
            parties, other than the service providers (like our order database and, in the
            future, our payment processor) needed to run the site.
          </p>
        </section>

        <section>
          <h2 className="font-display font-semibold text-maroon text-base mb-1">Questions</h2>
          <p>
            If you have questions about your information, reach out at{" "}
            <a href={`tel:${business.phone}`} className="text-rose underline">
              {business.phone}
            </a>{" "}
            or visit us at {business.address}.
          </p>
        </section>
      </div>
    </div>
  );
}
