import Image from "next/image";
import FloralCorner from "@/components/FloralCorner";
import { business } from "@/lib/data";
import TodayScheduleLabel from "@/components/TodayScheduleLabel";
import { InstagramIcon, PinIcon, ClockIcon, PhoneIcon } from "@/components/icons";


export default function ContactPage() {
  const mapsQuery = encodeURIComponent(business.address);
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;
  const telHref = `tel:+1${business.phone.replace(/\D/g, "")}`;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-8 py-12">
      <div className="relative">
        <FloralCorner className="hidden sm:block absolute -right-4 sm:-right-8 -top-12 w-40 sm:w-64" />
        <h1 className="relative font-display font-bold text-4xl sm:text-5xl text-wine-dark">
          Visit Chismesito <span className="text-berry">♡</span>
        </h1>
        <p className="relative mt-3 text-ink/75 sm:text-lg max-w-xl">Come by for your favorite drinks, fresh pastries, and a whole lot of chisme.</p>
      </div>

      <div className="mt-8 grid md:grid-cols-[1.1fr_1fr] gap-8 items-start">
        <div className="relative aspect-[4/3] rounded-[1.75rem] overflow-hidden shadow-[0_12px_36px_rgba(126,21,51,0.15)]">
          <Image src="/images/storefront.png" alt="Chismesito Cafe storefront in Richmond, CA" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover object-[40%_center]" priority />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <PinIcon className="w-7 h-7 text-ink shrink-0" />
            <div>
              <p className="font-bold text-ink">{business.streetAddress}</p>
              <p className="text-ink/70">
                {business.city}, {business.state} {business.zip}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <ClockIcon className="w-7 h-7 text-ink shrink-0" />
            <div>
              <p className="font-bold text-ink">Hours</p>
              <TodayScheduleLabel />
              {business.hours.split(" · ").map((h) => (
                <p key={h} className="text-ink/70 text-sm">
                  {h}
                </p>
              ))}
            </div>
          </div>
          <a href={telHref} className="flex gap-4 items-center hover:text-berry transition-colors">
            <PhoneIcon className="w-7 h-7 text-ink shrink-0" />
            <span className="font-bold">{business.phone}</span>
          </a>
          <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex gap-4 items-center hover:text-berry transition-colors">
            <InstagramIcon className="w-7 h-7 text-ink shrink-0" />
            <span className="font-bold">{business.instagram}</span>
          </a>

          <div className="flex flex-col gap-3 max-w-sm">
            <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="rounded-full bg-wine hover:bg-wine-dark text-white text-center font-semibold px-6 py-3.5 shadow-lg shadow-wine/20 transition-colors">
              Get Directions →
            </a>
            <a href={telHref} className="rounded-full border-2 border-wine text-wine text-center font-semibold px-6 py-3 hover:bg-wine hover:text-white transition-colors">
              Call Us
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 card-soft overflow-hidden">
        <iframe
          title="Map to Chismesito Cafe"
          src={`https://www.google.com/maps?q=${mapsQuery}&z=16&output=embed`}
          className="w-full h-80 sm:h-96 border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
