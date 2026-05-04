/** @deprecated Use `@/components/ui/Skeleton` directly. Kept as a thin
 *  shim so untouched pages keep compiling. */

import { Skeleton, SkeletonRail } from '@/components/ui/Skeleton';

const HEIGHT_MAP: Record<string, number> = {
  'h-3': 12,
  'h-4': 16,
  'h-6': 24,
  'h-32': 128,
  'h-48': 192,
};

const WIDTH_MAP: Record<string, number | string> = {
  'w-24': 96,
  'w-32': 128,
  'w-72': 288,
  'w-3/4': '75%',
  'w-full': '100%',
};

function parseHeight(c: string): number | string {
  return HEIGHT_MAP[c] ?? c;
}

function parseWidth(c: string): number | string {
  return WIDTH_MAP[c] ?? c;
}

export function SkeletonRow({
  count = 4,
}: {
  count?: number;
  heightClass?: string;
  widthClass?: string;
}) {
  return <SkeletonRail count={count} />;
}

export function SkeletonCard({
  heightClass = 'h-32',
  className = '',
}: {
  heightClass?: string;
  className?: string;
}) {
  return (
    <Skeleton
      variant="card"
      height={parseHeight(heightClass)}
      className={className}
    />
  );
}

export function SkeletonLine({
  widthClass = 'w-3/4',
  heightClass = 'h-3',
}: {
  widthClass?: string;
  heightClass?: string;
}) {
  return (
    <Skeleton
      variant="line"
      width={parseWidth(widthClass)}
      height={parseHeight(heightClass)}
    />
  );
}
