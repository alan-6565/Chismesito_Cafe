// "¿Ya supiste?" — a ribbon of cafe news scrolling across the page, like
// chisme being passed down the line. Edit the lines below as news changes.
const NEWS = [
  "Holiday Menu is here",
  "Fall Menu still pouring",
  "Dubai Chocolate Strawberry — every day, all day",
  "Now open 6 AM on weekdays",
  "Order ahead & skip the line",
  "Win 2 free drinks every month",
];

function Line() {
  return (
    <div className="flex shrink-0 items-center">
      {NEWS.map((n) => (
        <span key={n} className="flex items-center whitespace-nowrap">
          <span className="px-5 font-semibold tracking-wide">{n}</span>
          <span aria-hidden className="text-[color:var(--stripe-b)]/70">✦</span>
        </span>
      ))}
    </div>
  );
}

export default function ChismeTicker() {
  return (
    <section aria-label="Cafe news" className="relative overflow-hidden bg-[color:var(--stripe-a)] text-[#fff6ee] py-3 shadow-[inset_0_2px_0_rgba(255,255,255,.12)]">
      <div className="flex items-center">
        <span className="relative z-10 shrink-0 bg-[color:var(--stripe-a)] pl-4 sm:pl-8 pr-4 font-script text-2xl leading-none text-[#ffe3b8] shadow-[12px_0_16px_-6px_var(--stripe-a)]">
          ¿Ya supiste?
        </span>
        <div className="flex marquee w-max text-sm sm:text-[15px]">
          <Line />
          <Line />
        </div>
      </div>
    </section>
  );
}
