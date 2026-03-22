import { DashboardOverview } from "@/components/dashboard-overview";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Dashboard</p>
        <h2 className="text-3xl font-semibold tracking-tight">Registry overview</h2>
      </div>
      <DashboardOverview />
    </div>
  );
}

