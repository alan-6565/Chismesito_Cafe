import { InstagramIcon, TikTokIcon, FacebookIcon } from "./icons";

export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span title="Instagram" className="hover:opacity-70 transition-opacity cursor-pointer">
        <InstagramIcon />
      </span>
      <span title="TikTok" className="hover:opacity-70 transition-opacity cursor-pointer">
        <TikTokIcon />
      </span>
      <span title="Facebook" className="hover:opacity-70 transition-opacity cursor-pointer">
        <FacebookIcon />
      </span>
    </div>
  );
}
