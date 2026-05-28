import { redirect } from "next/navigation";

export default function ImportManualPage() {
  redirect("/admin/jobs/new");
}
