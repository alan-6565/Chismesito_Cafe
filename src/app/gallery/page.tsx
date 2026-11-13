import Reveal from "@/components/Reveal";
import PapelPicado from "@/components/story/PapelPicado";
import GalleryWall, { type WallPhoto } from "@/components/gallery/GalleryWall";
import { InstagramIcon } from "@/components/icons";
import { business, gallery } from "@/lib/data";
import { getMenu } from "@/lib/menu";

export const revalidate = 3600;

// The cafe's photos plus every drink photo uploaded in /admin/menu, so the
// gallery grows on its own as the menu gets pictures.
export default async function GalleryPage() {
  let menuPhotos: WallPhoto[] = [];
  try {
    menuPhotos = (await getMenu())
      .filter((i) => i.imageUrl && i.available)
      .map((i) => ({
        src: i.imageUrl!,
        alt: i.name,
        tag: "Drinks",
        w: 4,
        h: 5,
        href: `/menu?q=${encodeURIComponent(i.name)}`,
      }));
  } catch {
    // menu unavailable — show the cafe photos only
  }

  // Interleave cafe shots between drinks so the wall isn't all cups in a row
  const photos: WallPhoto[] = [];
  const cafe = [...gallery];
  menuPhotos.forEach((p, i) => {
    if (i % 3 === 0 && cafe.length) photos.push(cafe.shift()!);
    photos.push(p);
  });
  photos.push(...cafe);

  return (
    <div className="overflow-x-clip pb-16">
      <section className="relative bg-gradient-to-b from-blush-soft via-cream to-cream">
        <PapelPicado count={16} />
        <Reveal className="mx-auto max-w-3xl px-4 pt-12 pb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-berry">Gallery</p>
          <h1 className="mt-2 font-display font-bold text-4xl sm:text-6xl text-wine-dark">
            The Chismesito <span className="font-script text-berry">Experience</span>
          </h1>
          <p className="mt-4 text-ink/70 sm:text-lg">A peek at our drinks, our space &amp; our people. Tap any photo to look closer.</p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <GalleryWall photos={photos} />
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-8 pt-16">
        <Reveal>
          <a
            href={business.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row items-center justify-between gap-5 rounded-[2rem] bg-gradient-to-r from-wine via-berry to-[#e46d93] p-7 sm:p-9 text-white shadow-[0_24px_50px_-20px_rgba(126,21,51,.6)]"
          >
            <div className="text-center sm:text-left">
              <p className="font-script text-3xl text-[#ffe3b8]">Follow the chisme</p>
              <p className="font-display font-bold text-2xl sm:text-3xl">See our newest drinks on Instagram</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white text-wine-dark font-semibold px-6 py-3 shadow-lg transition-transform group-hover:scale-105">
              <InstagramIcon className="w-5 h-5" />
              {business.instagram}
            </span>
          </a>
        </Reveal>
      </section>
    </div>
  );
}
