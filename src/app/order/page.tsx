import Image from "next/image";
import Link from "next/link";
import { business } from "@/lib/data";

export default function OrderPage() {
  return (
    <>
      <div className="relative w-full aspect-[1768/696] overflow-hidden">
        <Image
          src="/images/order-banner.png"
          alt="Chismesito Cafe — Order Online. Great coffee, your way. Skip the line and get your favorites delivered or ready for pickup."
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />

        {/* Delivery card — replaces the lower-res card baked into the banner with a
            sharper standalone graphic, stretched slightly (~3% aspect difference,
            not noticeable) to exactly fill the same slot. */}
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

        {/* Pickup card */}
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

      <div className="relative w-full aspect-[1768/264]">
        <Image
          src="/images/order-features.png"
          alt="Freshly Made, High-Quality Ingredients, Support Local, Fast & Easy. How It Works: 1. Choose Your Option — Delivery (DoorDash) or Pickup (in-store). 2. Place Your Order — select your items and complete checkout. 3. Enjoy! We'll take care of the rest."
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </>
  );
}
