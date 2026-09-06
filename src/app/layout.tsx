import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Fraunces, Dancing_Script, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import CartDrawer from "@/components/CartDrawer";
import StructuredData from "@/components/StructuredData";
import { CartProvider } from "@/lib/cart-context";
import { business } from "@/lib/data";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700", "900"],
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const title = `${business.name} | ${business.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL("https://chismesitocafe.com"),
  title,
  description: business.subtitle,
  openGraph: {
    title,
    description: business.subtitle,
    url: "/",
    siteName: business.name,
    images: [{ url: "/images/hero.png", width: 1602, height: 1200, alt: business.tagline }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: business.subtitle,
    images: ["/images/hero.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dancing.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <StructuredData />
        <CartProvider>
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileTabBar />
          <CartDrawer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
