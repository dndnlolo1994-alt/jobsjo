import { JobCardSkeleton } from "@/components/Skeletons";

export default function ApplicationsLoading() {
  return (
    <section className="container-jo py-8">
      <div className="mb-6 h-8 w-48 rounded bg-slate-200 shimmer" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
      </div>
    </section>
  );
}
