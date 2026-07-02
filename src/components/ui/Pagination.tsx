import { Button } from "@/components/ui/Button";

type PaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  itemLabel?: string;
};

function getPageRange(page: number, pageSize: number, totalCount: number) {
  if (totalCount === 0) {
    return { start: 0, end: 0 };
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return { start, end };
}

export function Pagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  disabled = false,
  itemLabel = "items",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const { start, end } = getPageRange(page, pageSize, totalCount);
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-200 bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-600">
        Showing{" "}
        <span className="font-medium text-zinc-900">
          {start}–{end}
        </span>{" "}
        of <span className="font-medium text-zinc-900">{totalCount}</span>{" "}
        {itemLabel}
      </p>

      {totalPages > 1 ? (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between gap-3 sm:justify-end"
        >
          <span className="text-sm text-zinc-600">
            Page <span className="font-medium text-zinc-900">{page}</span> of{" "}
            <span className="font-medium text-zinc-900">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={disabled || !canGoPrevious}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={disabled || !canGoNext}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
