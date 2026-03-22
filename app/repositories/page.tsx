import { RepositoryTable } from "@/components/repositories/repository-table";

export default function RepositoriesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Repositories</p>
        <h2 className="text-3xl font-semibold tracking-tight">Explore your catalog</h2>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Search the proxied registry catalog and drill into repository-level workflows as the detail
          pages come online.
        </p>
      </div>
      <RepositoryTable />
    </div>
  );
}

