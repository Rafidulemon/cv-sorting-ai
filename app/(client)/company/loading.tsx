export default function CompanyLoading() {
  const shimmer = "animate-pulse bg-gradient-to-r from-white via-[#f7f3ff] to-white";
  const card = "rounded-3xl border border-white/70 bg-white/80 shadow-card-soft";

  return (
    <div className="space-y-6">
      <section className={`${card} p-6`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl ${shimmer}`} />
            <div className="space-y-2">
              <div className={`h-6 w-40 rounded-lg ${shimmer}`} />
              <div className={`h-4 w-24 rounded-lg ${shimmer}`} />
            </div>
          </div>
          <div className={`h-10 w-32 rounded-xl ${shimmer}`} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className={`${card} p-5 space-y-3`}>
            <div className={`h-4 w-24 rounded-lg ${shimmer}`} />
            <div className={`h-6 w-28 rounded-lg ${shimmer}`} />
            <div className={`h-3 w-20 rounded-lg ${shimmer}`} />
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className={`${card} p-6 lg:col-span-2 space-y-4`}>
          <div className={`h-5 w-40 rounded-lg ${shimmer}`} />
          <div className={`h-4 w-32 rounded-lg ${shimmer}`} />
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className={`h-3 w-full rounded-lg ${shimmer}`} />
          ))}
        </div>
        <div className={`${card} p-6 space-y-4`}>
          <div className={`h-5 w-32 rounded-lg ${shimmer}`} />
          <div className={`h-4 w-28 rounded-lg ${shimmer}`} />
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className={`h-10 w-full rounded-xl ${shimmer}`} />
          ))}
        </div>
      </section>

      <section className={`${card} p-6`}>
        <div className="flex items-center justify-between">
          <div className={`h-5 w-32 rounded-lg ${shimmer}`} />
          <div className={`h-9 w-28 rounded-xl ${shimmer}`} />
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={`h-12 w-full rounded-xl ${shimmer}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
