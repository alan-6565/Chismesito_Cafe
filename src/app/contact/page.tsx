import { business } from "@/lib/data";
import OpenStatusBadge from "@/components/OpenStatusBadge";

export default function ContactPage() {
  const mapsQuery = encodeURIComponent(business.address);
  const telHref = `tel:+1${business.phone.replace(/\D/g, "")}`;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-2 gap-10">
      <div>
        <h1 className="font-display font-bold text-3xl text-maroon flex items-center gap-3">
          Visit Chismesito
          <OpenStatusBadge />
        </h1>
        <div className="mt-6 flex flex-col gap-4 text-ink/80">
          <p>📍 {business.address}</p>
          <p>🕐 {business.hours}</p>
          <p>📞 {business.phone}</p>
          <p>📱 {business.instagram}</p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-rose hover:bg-rose-dark text-white font-semibold px-6 py-3 text-sm transition-colors"
          >
            Get Directions
          </a>
          <a
            href={telHref}
            className="rounded-full border-2 border-maroon text-maroon font-semibold px-6 py-3 text-sm hover:bg-maroon hover:text-cream transition-colors"
          >
            Call Us
          </a>
        </div>
      </div>
      <iframe
        title="Map to Chismesito Cafe"
        src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
        className="h-72 lg:h-full w-full rounded-3xl min-h-[280px] border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
