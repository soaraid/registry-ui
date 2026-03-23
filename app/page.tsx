import { DashboardOverview } from "@/components/dashboard-overview";
import { getAppBrandEnv } from "@/lib/env";

export default function DashboardPage() {
  const branding = getAppBrandEnv();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Dashboard</p>
        <h2 className="text-3xl font-semibold tracking-tight">Custom registry overview</h2>
      </div>
      <DashboardOverview branding={branding} />
    </div>
  );
}
