import Image from "next/image";
import PlaceholderImage from "@/components/PlaceholderImage";
import { gallery } from "@/lib/data";

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-center font-display font-bold text-3xl text-maroon">
        The Chismesito Experience
      </h1>
      <p className="text-center text-ink/60 mt-2">A peek at our drinks, our space & our people.</p>

      <div className="mt-8 columns-2 sm:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
        {gallery.map((g, i) => {
          const heightClass = i % 3 === 0 ? "h-64" : i % 3 === 1 ? "h-44" : "h-56";
          return g.image ? (
            <div
              key={g.id}
              className={`relative mb-4 rounded-2xl w-full overflow-hidden break-inside-avoid ${heightClass}`}
            >
              <Image src={g.image} alt={g.label} fill sizes="(min-width: 1024px) 25vw, 45vw" className="object-cover" />
            </div>
          ) : (
            <PlaceholderImage
              key={g.id}
              emoji={g.emoji}
              label={g.label}
              className={`mb-4 rounded-2xl w-full break-inside-avoid ${heightClass}`}
            />
          );
        })}
      </div>
    </div>
  );
}
