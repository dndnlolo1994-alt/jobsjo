import { headers } from "next/headers";
import { getCachedSessionUser } from "@/lib/auth";
import { NavbarClient } from "./NavbarClient";

export async function Navbar() {
  const pathname = (await headers()).get("x-pathname") || "";
  if (pathname.startsWith("/admin")) return null;

  const user = await getCachedSessionUser();
  return <NavbarClient user={user} />;
}
