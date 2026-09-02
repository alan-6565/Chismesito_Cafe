import PlaceholderImage from "@/components/PlaceholderImage";
import { business } from "@/lib/data";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-2 gap-10">
      <div>
        <h1 className="font-display font-bold text-3xl text-maroon">Visit Chismesito</h1>
        <div className="mt-6 flex flex-col gap-4 text-ink/80">
          <p>📍 {business.address}</p>
          <p>🕐 {business.hours}</p>
          <p>📞 {business.phone}</p>
          <p>📱 {business.instagram}</p>
          <p>🎵 {business.tiktok}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <button className="rounded-full bg-rose hover:bg-rose-dark text-white font-semibold px-6 py-3 text-sm transition-colors">
            Get Directions
          </button>
          <button className="rounded-full border-2 border-maroon text-maroon font-semibold px-6 py-3 text-sm hover:bg-maroon hover:text-cream transition-colors">
            Call Us
          </button>
        </div>
      </div>
      <PlaceholderImage emoji="🗺️" label="Embedded map" className="h-72 lg:h-full rounded-3xl min-h-[280px]" />
    </div>
  );
}
