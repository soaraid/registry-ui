import { RepositoryDetailClient } from "@/components/repositories/repository-detail-client";
import { decodeRepositorySegments } from "@/lib/paths";

interface RepositoryDetailPageProps {
  params: Promise<{
    repository: string[];
  }>;
}

export default async function RepositoryDetailPage({ params }: RepositoryDetailPageProps) {
  const { repository } = await params;
  const decodedRepository = decodeRepositorySegments(repository);

  return <RepositoryDetailClient repository={decodedRepository} />;
}

