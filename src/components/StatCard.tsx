export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const accent = {
    default: "text-navy-900",
    success: "text-emerald-700",
    warning: "text-sand-700",
    danger: "text-red-700",
  }[tone];
  return (
    <div className="card-pad">
      <div className="text-sm text-navy-500">{label}</div>
      <div className={`text-3xl font-extrabold mt-1 ${accent}`}>{value}</div>
      {hint && <div className="text-xs text-navy-400 mt-1">{hint}</div>}
    </div>
  );
}
