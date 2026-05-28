export function EmptyState({
  title,
  description,
  action,
  icon = "📭",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: string;
}) {
  return (
    <div className="text-center py-12 px-6">
      <div className="text-5xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-navy-800">{title}</h3>
      {description && <p className="text-navy-500 mt-2 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
