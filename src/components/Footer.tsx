import Link from "next/link";
import Logo from "./Logo";
import SocialLinks from "./SocialLinks";
import { business } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-maroon text-cream mt-16 pb-16 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="font-display font-bold text-lg">{business.name}</span>
        </div>
        <p className="font-script text-2xl text-blush">
          &ldquo;Life happens, coffee helps, &amp; a little chisme doesn&apos;t hurt.&rdquo; 💕
        </p>
        <div className="flex gap-6 text-sm text-cream/70">
          <Link href="/menu" className="hover:text-cream">Menu</Link>
          <Link href="/about" className="hover:text-cream">About</Link>
          <Link href="/order" className="hover:text-cream">Order</Link>
          <Link href="/contact" className="hover:text-cream">Contact</Link>
        </div>
        <SocialLinks className="text-cream" />
        <p className="text-xs text-cream/50">
          © {new Date().getFullYear()} {business.name}. All rights reserved. ·{" "}
          <Link href="/privacy" className="hover:text-cream underline">
            Privacy Policy
          </Link>{" "}
          ·{" "}
          <Link href="/terms" className="hover:text-cream underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </footer>
  );
}
