interface Props {
  size?: number
  className?: string
}

export function ClaimCastIcon({ size = 40, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="cc-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="cc-bolt" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#BAE6FD" />
        </linearGradient>
      </defs>

      {/* Outer broadcast arc */}
      <path
        d="M6 20 A14 14 0 0 1 34 20"
        stroke="url(#cc-grad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      {/* Mid broadcast arc */}
      <path
        d="M10 20 A10 10 0 0 1 30 20"
        stroke="url(#cc-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      {/* Inner broadcast arc */}
      <path
        d="M14 20 A6 6 0 0 1 26 20"
        stroke="url(#cc-grad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Lightning bolt */}
      <path
        d="M22.5 9.5 L16.5 20.5 H21.5 L17.5 30.5 L27 18 H21.5 Z"
        fill="url(#cc-bolt)"
        filter="drop-shadow(0 0 4px rgba(59,130,246,0.8))"
      />
    </svg>
  )
}

export function ClaimCastWordmark({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <ClaimCastIcon size={36} />
      <span
        className="font-black tracking-tight"
        style={{
          fontSize: "1.25rem",
          background: dark
            ? "linear-gradient(135deg, #1E3A5F 0%, #0E7490 100%)"
            : "linear-gradient(135deg, #60A5FA 0%, #22D3EE 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.02em",
        }}
      >
        ClaimCast
      </span>
    </div>
  )
}
