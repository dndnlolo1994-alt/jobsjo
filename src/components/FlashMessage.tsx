import { cn } from "@/lib/utils";

type Props = {
  kind?: "success" | "error" | "info" | "warning";
  title?: string;
  children: React.ReactNode;
};

export function FlashMessage({ kind = "info", title, children }: Props) {
  const map = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    error: "bg-red-50 border-red-200 text-red-900",
    info: "bg-navy-50 border-navy-200 text-navy-900",
    warning: "bg-sand-50 border-sand-200 text-sand-900",
  };
  return (
    <div className={cn("border rounded-xl p-3 text-sm", map[kind])}>
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div>{children}</div>
    </div>
  );
}
