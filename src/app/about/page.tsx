import Image from "next/image";
import PlaceholderImage from "@/components/PlaceholderImage";
import { business } from "@/lib/data";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <h1 className="font-display font-bold text-3xl text-maroon">Our Story</h1>
        <p className="mt-5 text-ink/70 leading-relaxed">{business.story}</p>
        <div className="mt-6 flex gap-8">
          <div>
            <p className="font-display font-bold text-2xl text-rose">2023</p>
            <p className="text-xs text-ink/60">Founded</p>
          </div>
          <div>
            <p className="font-display font-bold text-2xl text-rose">3,000+</p>
            <p className="text-xs text-ink/60">Instagram Family</p>
          </div>
          <div>
            <p className="font-display font-bold text-2xl text-rose">30+</p>
            <p className="text-xs text-ink/60">Menu Items</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <PlaceholderImage emoji="👩‍🍳" label="Founders" className="h-40 rounded-2xl" />
        <PlaceholderImage emoji="☕" label="Handcrafted drinks" className="h-40 rounded-2xl mt-6" />
        <div className="relative h-40 rounded-2xl overflow-hidden -mt-6">
          <Image
            src="/images/storefront.png"
            alt="Chismesito Cafe storefront in Richmond, CA"
            fill
            sizes="(min-width: 1024px) 25vw, 45vw"
            className="object-cover"
          />
        </div>
        <PlaceholderImage emoji="💕" label="Community" className="h-40 rounded-2xl" />
      </div>
    </div>
  );
}
