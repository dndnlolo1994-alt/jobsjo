import { getSessionUser } from "@/lib/session";
import { NavbarClient } from "./NavbarClient";

export async function Navbar() {
  const user = await getSessionUser();
  return <NavbarClient user={user} />;
}
