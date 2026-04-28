import { redirect } from "next/navigation";

// Dashboard home — redirect to clients for now (Phase 9 will build the full dashboard)
export default function DashboardPage() {
  redirect("/clients");
}
