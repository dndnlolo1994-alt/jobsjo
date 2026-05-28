import { cn } from "@/lib/utils";

type Variant = "info" | "success" | "warning" | "danger" | "muted";

export function Badge({
  children,
  variant = "info",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const map: Record<Variant, string> = {
    info: "badge-info",
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    muted: "badge-muted",
  };
  return <span className={cn(map[variant], className)}>{children}</span>;
}
