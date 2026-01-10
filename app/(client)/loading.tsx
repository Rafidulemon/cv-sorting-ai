export default function ClientLayoutLoading() {
  const shimmer = "animate-pulse bg-gradient-to-r from-white via-[#f7f3ff] to-white";
  const card = "rounded-3xl border border-white/70 bg-white/80 shadow-card-soft";

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_18%_16%,rgba(216,8,128,0.08),transparent_38%),radial-gradient(circle_at_82%_10%,rgba(61,100,255,0.08),transparent_38%),radial-gradient(circle_at_10%_70%,rgba(216,8,128,0.06),transparent_35%),linear-gradient(180deg,#f9f6ff,#f5f6ff,#fdf9ff)] text-[#1f2a44]">
      <div className="relative mx-auto flex gap-6 px-4 py-6 md:px-6">
        <aside className="hidden h-[calc(100vh-3rem)] w-64 rounded-xl border border-white/70 bg-white/85 p-5 shadow-card-soft lg:block">
          <div className={`h-10 w-32 rounded-lg ${shimmer}`} />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className={`h-10 w-full rounded-lg ${shimmer}`} />
            ))}
          </div>
        </aside>

        <div className="flex w-full flex-col gap-4">
          <section className={`${card} p-4 md:p-6`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className={`h-10 w-48 rounded-lg ${shimmer}`} />
              <div className={`h-9 w-28 rounded-xl ${shimmer}`} />
            </div>
          </section>

          <main className="flex-1">
            <div className={`${card} p-4 md:p-6 space-y-4`}>
              <div className={`h-6 w-40 rounded-lg ${shimmer}`} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className={`${card} p-4 space-y-3`}>
                    <div className={`h-4 w-24 rounded-lg ${shimmer}`} />
                    <div className={`h-5 w-32 rounded-lg ${shimmer}`} />
                    <div className={`h-3 w-28 rounded-lg ${shimmer}`} />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
