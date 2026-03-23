import { cn } from "@/lib/utils";
import Image from "next/image";

interface BrandLockupProps {
  brandName: string;
  productName: string;
  compact?: boolean;
  className?: string;
}

export function BrandLockup({
  brandName,
  productName,
  compact = false,
  className,
}: BrandLockupProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl border border-emerald-500/15 bg-[#07110c] shadow-[0_8px_24px_rgba(6,18,12,0.12)]",
          compact ? "h-12 w-12" : "h-14 w-14",
        )}
      >
        <Image
          src="/brand/logo.png"
          alt={`${brandName} logo`}
          fill
          sizes={compact ? "48px" : "56px"}
          className="object-contain p-1.5"
          priority
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs uppercase tracking-[0.35em] text-muted-foreground">
          {brandName}
        </p>
        <p
          className={cn(
            "mt-1 truncate font-semibold tracking-tight",
            compact ? "text-xl" : "text-2xl",
          )}
        >
          {productName}
        </p>
      </div>
    </div>
  );
}
