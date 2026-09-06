import { InstagramIcon, TikTokIcon, FacebookIcon } from "./icons";
import { business } from "@/lib/data";

export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <a
        href={business.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Instagram"
        className="hover:opacity-70 transition-opacity"
      >
        <InstagramIcon />
      </a>
      <a
        href={business.tiktokUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="TikTok"
        className="hover:opacity-70 transition-opacity"
      >
        <TikTokIcon />
      </a>
      {/* No confirmed Facebook page URL yet — decorative until the client provides one. */}
      <span title="Facebook" className="opacity-60">
        <FacebookIcon />
      </span>
    </div>
  );
}
