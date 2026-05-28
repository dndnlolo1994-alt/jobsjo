import { JobCardSkeleton, JobFiltersSkeleton } from "@/components/Skeletons";

export default function JobsLoading() {
  return (
    <section className="container-jo py-8">
      <div className="mb-6 space-y-3">
        <div className="h-8 w-44 rounded bg-slate-200 shimmer" />
        <div className="h-4 w-72 max-w-full rounded bg-slate-100 shimmer" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="no-print"><JobFiltersSkeleton /></aside>
        <main className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </main>
      </div>
    </section>
  );
}
