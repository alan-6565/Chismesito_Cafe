import type { Metadata } from "next";
import { Fraunces, Dancing_Script, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileTabBar from "@/components/MobileTabBar";
import CartDrawer from "@/components/CartDrawer";
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

export const metadata: Metadata = {
  title: `${business.name} | ${business.tagline}`,
  description: business.subtitle,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dancing.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <CartProvider>
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileTabBar />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
