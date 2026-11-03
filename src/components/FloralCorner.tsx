import Image from "next/image";

/** The flower bunch from the cafe's hero art, faded where the crop cuts it */
export default function FloralCorner({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none aspect-[340/320] -scale-x-100 [mask-image:linear-gradient(to_right,transparent,black_22%),linear-gradient(to_top,transparent,black_22%)] [mask-composite:intersect] ${className}`}
    >
      <Image src="/images/florals-clear.png" alt="" fill sizes="256px" className="object-contain" />
    </div>
  );
}
