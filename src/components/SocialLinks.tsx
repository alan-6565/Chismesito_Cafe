import { InstagramIcon } from "./icons";
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
    </div>
  );
}
