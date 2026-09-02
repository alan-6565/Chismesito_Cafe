import Image from "next/image";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "h-20 w-20" : size === "sm" ? "h-9 w-9" : "h-12 w-12";
  const sizesAttr = size === "lg" ? "80px" : size === "sm" ? "36px" : "48px";

  return (
    <div
      className={`${dims} relative shrink-0 rounded-full bg-cream border-2 border-blush shadow-sm overflow-hidden`}
    >
      <Image
        src="/images/logo.png"
        alt="Chismesito Cafe logo"
        fill
        sizes={sizesAttr}
        className="object-cover"
      />
    </div>
  );
}
