import Link from "next/link";
import { business } from "@/lib/data";

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14 text-center">
      <h1 className="font-display font-bold text-3xl text-maroon">Order Online</h1>
      <p className="mt-2 text-ink/60">Skip the line and order ahead!</p>

      <div className="mt-10 grid sm:grid-cols-2 gap-6">
        <div className="rounded-3xl bg-white shadow-sm p-8 flex flex-col items-center gap-3">
          <span className="text-5xl">🚗</span>
          <h2 className="font-display font-semibold text-xl text-maroon">Delivery</h2>
          <p className="text-sm text-ink/60">Order your favorites for delivery.</p>
          <a
            href={business.doordashUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 rounded-full bg-rose hover:bg-rose-dark text-white font-semibold px-6 py-3 text-sm transition-colors"
          >
            Order on DoorDash
          </a>
        </div>
        <div className="rounded-3xl bg-white shadow-sm p-8 flex flex-col items-center gap-3">
          <span className="text-5xl">🛍️</span>
          <h2 className="font-display font-semibold text-xl text-maroon">Pickup</h2>
          <p className="text-sm text-ink/60">Order ahead and pick it up in-store.</p>
          <Link
            href="/menu"
            className="mt-2 rounded-full border-2 border-maroon text-maroon font-semibold px-6 py-3 text-sm hover:bg-maroon hover:text-cream transition-colors"
          >
            Order for Pickup
          </Link>
        </div>
      </div>

      <p className="mt-10 text-xs text-ink/40">
        These buttons link out to your existing delivery/ordering provider — no integration
        required to launch.
      </p>
    </div>
  );
}
