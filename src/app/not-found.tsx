import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24 text-center">
      <span className="text-5xl">🌸</span>
      <h1 className="mt-4 font-display font-bold text-3xl text-maroon">Page Not Found</h1>
      <p className="mt-2 text-ink/60">
        We couldn&rsquo;t find what you were looking for — but the menu&rsquo;s always there.
      </p>
      <Link
        href="/"
        className="inline-block mt-8 rounded-full bg-rose hover:bg-rose-dark text-white font-semibold px-6 py-3 text-sm transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
