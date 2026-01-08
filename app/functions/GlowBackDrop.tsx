export function GlowBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-primary-500/25 blur-[140px]" />
      <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-violet-500/20 blur-[150px]" />
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(900px_320px_at_50%_0%,rgba(255,255,255,0.35),transparent)]" />
    </div>
  );
}