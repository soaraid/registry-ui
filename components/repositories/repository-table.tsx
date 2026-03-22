"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Box, Search } from "lucide-react";

import { useRegistryCatalog } from "@/hooks/use-registry-catalog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildRepositoryPagePath } from "@/lib/paths";

export function RepositoryTable() {
  const [query, setQuery] = useState("");
  const catalogQuery = useRegistryCatalog();
  const items = catalogQuery.data?.repositories ?? [];
  const normalizedQuery = query.trim().toLowerCase();
  const repositories = normalizedQuery
    ? items.filter((repository) => repository.toLowerCase().includes(normalizedQuery))
    : items;

  return (
    <Card>
      <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardDescription>Repository explorer</CardDescription>
          <CardTitle>Catalog</CardTitle>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search repositories"
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        {catalogQuery.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : catalogQuery.isError ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
            {(catalogQuery.error as Error).message}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>Surface</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repositories.map((repository) => (
                <TableRow key={repository}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
                        <Box className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <div>
                        <div className="font-medium">{repository}</div>
                        <div className="text-xs text-muted-foreground">Synced from /v2/_catalog</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Tags pending</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={buildRepositoryPagePath(repository)}
                      className="inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-white"
                    >
                      Manage
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {repositories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                    No repositories matched your search.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
