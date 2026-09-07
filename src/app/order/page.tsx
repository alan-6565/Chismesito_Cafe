import Image from "next/image";
import Link from "next/link";
import { business } from "@/lib/data";

export default function OrderPage() {
  return (
    <div className="relative w-full aspect-[1762/704] overflow-hidden">
      <Image
        src="/images/order-banner.png"
        alt="Chismesito Cafe — Order Online. Great coffee, your way. Skip the line and get your favorites delivered or ready for pickup."
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />

      {/* Invisible hotspots aligned over the baked-in Delivery/Pickup buttons — visible tint on hover so the hit target is discoverable */}
      <a
        href={business.doordashUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on DoorDash"
        className="absolute rounded-full hover:bg-white/10 transition-colors"
        style={{ left: "26.7%", top: "65.3%", width: "21%", height: "8.5%" }}
      />
      <Link
        href="/menu"
        aria-label="Order for Pickup"
        className="absolute rounded-full hover:bg-white/10 transition-colors"
        style={{ left: "54.2%", top: "65.3%", width: "19.6%", height: "8.5%" }}
      />
    </div>
  );
}
