export default function IntegrationsPage() {
  return (
    <div className="space-y-6 text-[#1f2a44]">
      <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-card-soft backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#e2e7ff] blur-3xl" />
          <div className="absolute right-6 top-8 h-32 w-32 rounded-full bg-primary-100 blur-3xl" />
        </div>
        <div className="relative space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">Integrations</p>
          <h1 className="text-3xl font-semibold leading-tight text-[#1f2a44] sm:text-4xl">Coming soon</h1>
          <p className="max-w-2xl text-sm text-[#8a90a6]">
            We&apos;re bringing ATS, HRIS, and communication integrations to keep your hiring data in sync.
            You&apos;ll be able to connect your stack and automate more of your workflows right from carriX.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="rounded-full bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700">
              ATS sync
            </span>
            <span className="rounded-full bg-[#f0f5ff] px-4 py-2 text-xs font-semibold text-[#3D64FF]">
              HRIS updates
            </span>
            <span className="rounded-full bg-[#fff4f8] px-4 py-2 text-xs font-semibold text-[#d80880]">
              Messaging hooks
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
