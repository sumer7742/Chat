/**
 * Ambient floating-hearts layer. Purely decorative, pointer-events-none, sits
 * behind content. Positions/timings are deterministic (index-derived) so it
 * never re-randomises on re-render.
 */
const HEARTS = ['❤️', '💗', '💕', '💖', '🌸', '✨', '💜'];

export function FloatingHearts({ count = 14 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 37) % 100;
        const size = 14 + ((i * 7) % 22);
        const duration = 9 + ((i * 5) % 12);
        const delay = -((i * 13) % 14);
        return (
          <span
            key={i}
            className="absolute bottom-[-40px] animate-heart-rise select-none"
            style={{
              left: `${left}%`,
              fontSize: `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              opacity: 0.7,
            }}
          >
            {HEARTS[i % HEARTS.length]}
          </span>
        );
      })}
    </div>
  );
}
