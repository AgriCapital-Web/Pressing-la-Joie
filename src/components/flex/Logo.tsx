import logoUrl from "@/assets/flexcard-logo.png";

export function Logo({ className = "h-8", showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <img
      src={logoUrl}
      alt={showWord ? "FlexCard" : ""}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <div
      className="inline-flex items-center justify-center rounded-xl bg-gradient-brand shadow-glow"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h6v6H4z" />
        <path d="M10 7h4M14 4v6M18 4l-2 3M18 10l-2-3M14 14v8M14 18h4M18 18l2 2M10 14H6M6 14v6" />
      </svg>
    </div>
  );
}
