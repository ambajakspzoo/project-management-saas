import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ProjectsDashboard } from "@/components/projects/ProjectsDashboard";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <ProjectsDashboard userEmail={session.user?.email ?? undefined} />
  );
}
