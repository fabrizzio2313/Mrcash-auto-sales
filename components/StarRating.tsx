// Read-only star display. Renders 5 stars with `rating` of them filled.
// Pure/server-safe — used in review lists on the public site and admin.

function Star({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path
        d="m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.9-5.3-2.8-5.3 2.8 1-5.9L4.5 9.7l5.9-.9L12 3.5Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StarRating({
  rating,
  className = "h-4 w-4",
  label,
}: {
  rating: number;
  className?: string;
  label?: string;
}) {
  const rounded = Math.round(rating);
  return (
    <span
      className="inline-flex items-center gap-0.5 text-amber-500"
      role="img"
      aria-label={label ?? `${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= rounded} className={className} />
      ))}
    </span>
  );
}
