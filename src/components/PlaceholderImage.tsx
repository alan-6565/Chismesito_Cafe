export default function PlaceholderImage({
  emoji,
  label,
  className = "",
}: {
  emoji: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-blush-soft to-blush text-maroon-soft ${className}`}
    >
      <span className="text-4xl">{emoji}</span>
      {label && <span className="text-[10px] font-medium opacity-60">{label}</span>}
    </div>
  );
}
