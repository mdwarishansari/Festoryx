import { redirect } from "next/navigation";

export default function SuperAdminSSORedirectPage() {
  redirect("http://localhost:3002/admin");
}
