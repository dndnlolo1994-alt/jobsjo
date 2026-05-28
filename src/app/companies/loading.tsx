import { CompanyCardSkeleton } from "@/components/Skeletons";

export default function CompaniesLoading() {
  return (
    <section className="container-jo py-8">
      <div className="mb-6 h-8 w-44 rounded bg-slate-200 shimmer" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => <CompanyCardSkeleton key={i} />)}
      </div>
    </section>
  );
}
