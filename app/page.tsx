import { DashboardShell } from "@/components/DashboardShell";
import { getDashboardSnapshot } from "@/lib/queries/dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const snapshot = await getDashboardSnapshot("sangil-5-551");

  return (
    <DashboardShell
      overview={snapshot.overview}
      granularities={snapshot.granularities}
      quality={snapshot.quality}
    />
  );
}
