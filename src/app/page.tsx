import { redirect } from "next/navigation";

// Root page — redirect to the main dashboard
export default function Home() {
  redirect("/clients");
}
