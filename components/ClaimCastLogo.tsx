interface Props {
  size?: number
  className?: string
}

export function ClaimCastIcon({ size = 40, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Deep storm-sky background */}
        <radialGradient id="cc-bg" cx="38%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="55%" stopColor="#0f1e4a" />
          <stop offset="100%" stopColor="#050d1f" />
        </radialGradient>

        {/* Storm spiral — electric blue-cyan */}
        <linearGradient id="cc-swirl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>

        {/* Lightning bolt — gold to amber */}
        <linearGradient id="cc-bolt" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>

        {/* Glow filter for lightning */}
        <filter id="cc-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Clip to circle */}
        <clipPath id="cc-clip">
          <circle cx="22" cy="22" r="21" />
        </clipPath>
      </defs>

      {/* Background circle */}
      <circle cx="22" cy="22" r="21" fill="url(#cc-bg)" />

      {/* Outer border glow */}
      <circle cx="22" cy="22" r="20.5" stroke="url(#cc-swirl)" strokeWidth="0.8" fill="none" opacity="0.5" />

      {/* Hurricane spiral — 3 nested arcs getting smaller, all starting from top sweeping clockwise */}
      {/* Outer arc: r=15, ~270° from top to left  */}
      <path
        d="M 22 7 A 15 15 0 1 1 7 22"
        stroke="url(#cc-swirl)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      {/* Mid arc: r=11 */}
      <path
        d="M 22 11 A 11 11 0 1 1 11 22"
        stroke="url(#cc-swirl)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.65"
      />
      {/* Inner arc: r=7 */}
      <path
        d="M 22 15 A 7 7 0 1 1 15 22"
        stroke="url(#cc-swirl)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />

      {/* Storm eye — soft glow at center */}
      <circle cx="22" cy="22" r="2.5" fill="#38bdf8" opacity="0.18" />
      <circle cx="22" cy="22" r="1.2" fill="#7dd3fc" opacity="0.35" />

      {/* Lightning bolt — the defining icon element */}
      <path
        d="M 26 7.5 L 17.5 22 H 23 L 18 36.5 L 30 20 H 24.5 Z"
        fill="url(#cc-bolt)"
        filter="url(#cc-glow)"
        clipPath="url(#cc-clip)"
      />
    </svg>
  )
}

export function ClaimCastWordmark({
  className = "",
  dark = false,
}: {
  className?: string
  dark?: boolean
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <ClaimCastIcon size={36} />
      <div className="flex items-baseline gap-0">
        <span
          style={{
            fontWeight: 900,
            fontSize: "1.2rem",
            letterSpacing: "-0.03em",
            background: dark
              ? "linear-gradient(135deg, #1e40af 0%, #0891b2 100%)"
              : "linear-gradient(135deg, #60a5fa 0%, #38bdf8 50%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Claim
        </span>
        <span
          style={{
            fontWeight: 900,
            fontSize: "1.2rem",
            letterSpacing: "-0.03em",
            background: dark
              ? "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)"
              : "linear-gradient(135deg, #facc15 0%, #fb923c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Cast
        </span>
      </div>
    </div>
  )
}
