import { DashboardShell } from "@/components/DashboardShell";
import { getDashboardSnapshot } from "@/lib/queries/dashboard";

export default async function HomePage() {
  const snapshot = await getDashboardSnapshot("sangil-5-551");

  return (
    <DashboardShell
      overview={snapshot.overview}
      hourly={snapshot.hourly}
      originToZone={snapshot.originToZone}
      zoneToDestination={snapshot.zoneToDestination}
      quality={snapshot.quality}
    />
  );
}
