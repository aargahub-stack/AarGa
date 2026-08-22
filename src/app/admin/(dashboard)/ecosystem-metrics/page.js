import { getAllMetrics } from "@/lib/api/ecosystemMetrics";
import MetricsManagerView from "./MetricsManagerView";

export default async function AdminEcosystemMetricsPage() {
  const metrics = await getAllMetrics();

  return <MetricsManagerView initialMetrics={metrics} />;
}
