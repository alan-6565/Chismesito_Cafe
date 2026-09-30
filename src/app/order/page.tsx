import Image from "next/image";
import Link from "next/link";
import { business } from "@/lib/data";
import { HeartIcon, BagIcon, TruckIcon, ArrowRightIcon } from "@/components/icons";

export default function OrderPage() {
  return (
      <section className="relative overflow-hidden bg-gradient-to-b from-cream via-[#f8ebe3] to-[#efdccd]">
        {/* Decorative photos, faded into the background at their inner edges. */}
        <div
          aria-hidden
          className="hidden md:block absolute left-0 bottom-0 w-[22vw] max-w-[345px] aspect-[345/562] [mask-image:linear-gradient(to_right,black_70%,transparent),linear-gradient(to_bottom,transparent,black_18%)] [mask-composite:intersect]"
        >
          <Image src="/images/order-drink.png" alt="" fill sizes="22vw" className="object-cover" priority />
        </div>
        <div
          aria-hidden
          className="hidden md:block absolute right-0 bottom-0 w-[22vw] max-w-[340px] aspect-[340/440] [mask-image:linear-gradient(to_left,black_70%,transparent),linear-gradient(to_bottom,transparent,black_18%)] [mask-composite:intersect]"
        >
          <Image src="/images/order-croissant.png" alt="" fill sizes="22vw" className="object-cover" priority />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pt-14 pb-14 md:pt-20 md:pb-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose">{business.name}</p>
          <h1 className="mt-3 font-display font-black text-5xl sm:text-6xl md:text-7xl text-maroon tracking-tight">
            Order Online
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-maroon/80">Choose how you&apos;d like to order.</p>

          <div className="mt-10 mx-auto max-w-3xl rounded-3xl bg-white/60 backdrop-blur-sm border border-blush/60 shadow-sm grid sm:grid-cols-2">
            <div className="flex flex-col items-center gap-5 px-6 py-8 sm:py-10">
              <span className="w-24 h-24 rounded-full bg-blush-soft flex items-center justify-center">
                <BagIcon className="w-11 h-11 text-maroon" />
              </span>
              <Link
                href="/menu"
                className="w-full max-w-xs flex items-center justify-center gap-3 rounded-full bg-rose hover:bg-rose-dark text-white font-semibold text-lg px-6 py-4 shadow-sm transition-colors"
              >
                Order Online <ArrowRightIcon />
              </Link>
              <p className="text-ink/60">Order ahead for pickup.</p>
            </div>
            <div className="flex flex-col items-center gap-5 px-6 py-8 sm:py-10 border-t sm:border-t-0 sm:border-l border-blush">
              <span className="w-24 h-24 rounded-full bg-blush-soft flex items-center justify-center">
                <TruckIcon className="w-12 h-12 text-maroon" />
              </span>
              <a
                href={business.doordashUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-xs flex items-center justify-center gap-3 rounded-full border-2 border-maroon text-maroon hover:bg-maroon hover:text-cream font-semibold text-lg px-6 py-3.5 transition-colors"
              >
                Order Through App <ArrowRightIcon />
              </a>
              <p className="text-ink/60">Use a delivery app for delivery.</p>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4 text-rose">
            <span className="h-px w-24 sm:w-56 bg-blush" />
            <HeartIcon className="w-6 h-6" />
            <span className="h-px w-24 sm:w-56 bg-blush" />
          </div>
          <p className="mt-3 text-sm italic text-ink/60">
            Pickup through our site <span className="mx-1.5 text-rose">&bull;</span> Delivery through your preferred app.
          </p>
        </div>
      </section>
  );
}
