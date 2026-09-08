import Image from "next/image";
import Link from "next/link";
import { business } from "@/lib/data";
import { CupIcon, LeafIcon, HeartIcon, ClockIcon } from "@/components/icons";

const FEATURES = [
  { Icon: CupIcon, title: "Freshly Made", text: "Your favorites, always fresh." },
  { Icon: LeafIcon, title: "High-Quality Ingredients", text: "Coffee, pastries, and more." },
  { Icon: HeartIcon, title: "Support Local", text: "A small business, big heart." },
  { Icon: ClockIcon, title: "Fast & Easy", text: "Order in just a few taps." },
];

const STEPS = [
  { title: "Choose Your Option", text: "Delivery (DoorDash) or Pickup (in-store)." },
  { title: "Place Your Order", text: "Select your items and complete checkout." },
  { title: "Enjoy!", text: "We'll take care of the rest." },
];

export default function OrderPage() {
  return (
    <>
      {/* Desktop — single banner image with sharper Delivery/Pickup cards
          layered on top. Below lg, the banner's baked-in text scales down
          illegibly, so mobile gets a real stacked layout instead (below). */}
      <div className="hidden lg:block relative w-full aspect-[1768/696] overflow-hidden">
        <Image
          src="/images/order-banner.png"
          alt="Chismesito Cafe — Order Online. Great coffee, your way. Skip the line and get your favorites delivered or ready for pickup."
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />

        <div className="absolute" style={{ left: "24.3%", top: "34.9%", width: "25.2%", height: "60.6%" }}>
          <Image
            src="/images/order-delivery-card.png"
            alt="Delivery — order your favorites for delivery through DoorDash"
            fill
            sizes="30vw"
            className="object-fill"
          />
          <a
            href={business.doordashUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Order on DoorDash"
            className="absolute rounded-full hover:bg-white/10 transition-colors"
            style={{ left: "12%", top: "56.2%", width: "74.2%", height: "10.6%" }}
          />
        </div>

        <div className="absolute" style={{ left: "51.2%", top: "34.9%", width: "24.5%", height: "60.6%" }}>
          <Image
            src="/images/order-pickup-card.png"
            alt="Pickup — order ahead and pick it up in-store"
            fill
            sizes="30vw"
            className="object-fill"
          />
          <Link
            href="/menu"
            aria-label="Order for Pickup"
            className="absolute rounded-full hover:bg-white/10 transition-colors"
            style={{ left: "19.6%", top: "68.9%", width: "59.1%", height: "5.4%" }}
          />
        </div>
      </div>

      <div className="hidden lg:block relative w-full aspect-[1768/264]">
        <Image
          src="/images/order-features.png"
          alt="Freshly Made, High-Quality Ingredients, Support Local, Fast & Easy. How It Works: 1. Choose Your Option — Delivery (DoorDash) or Pickup (in-store). 2. Place Your Order — select your items and complete checkout. 3. Enjoy! We'll take care of the rest."
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Mobile — same two card graphics, stacked full-width (Pickup first),
          same button positions since they're percentages of each image. */}
      <div className="lg:hidden">
        <div className="px-4 pt-8 pb-2 text-center">
          <p className="font-display font-bold text-3xl text-maroon">Order Online</p>
          <p className="text-ink/60 italic mt-1">Skip the line and order ahead!</p>
        </div>

        <div className="px-4 flex flex-col gap-4 mt-2">
          <div className="relative w-full aspect-[1052/1070] rounded-3xl overflow-hidden">
            <Image
              src="/images/order-pickup-card.png"
              alt="Pickup — order ahead and pick it up in-store"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <Link
              href="/menu"
              aria-label="Order for Pickup"
              className="absolute rounded-full hover:bg-white/10 transition-colors"
              style={{ left: "19.6%", top: "68.9%", width: "59.1%", height: "5.4%" }}
            />
          </div>

          <div className="relative w-full aspect-[1086/1066] rounded-3xl overflow-hidden">
            <Image
              src="/images/order-delivery-card.png"
              alt="Delivery — order your favorites for delivery through DoorDash"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <a
              href={business.doordashUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Order on DoorDash"
              className="absolute rounded-full hover:bg-white/10 transition-colors"
              style={{ left: "12%", top: "56.2%", width: "74.2%", height: "10.6%" }}
            />
          </div>
        </div>

        <div className="px-4 py-8 flex flex-col gap-6">
          {FEATURES.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4">
              <Icon className="w-7 h-7 text-rose shrink-0" />
              <div>
                <p className="font-display font-semibold text-maroon">{title}</p>
                <p className="text-ink/60 text-sm">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 pb-10">
          <div className="rounded-3xl bg-blush p-6">
            <p className="font-display font-bold text-lg text-maroon mb-4">How It Works</p>
            <div className="flex flex-col gap-4">
              {STEPS.map((step, i) => (
                <div key={step.title} className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-rose text-white text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-maroon">{step.title}</p>
                    <p className="text-ink/60 text-sm">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
