type PaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, total)

  return (
    <nav className="pagination" aria-label="Vulnerability pages">
      <span aria-live="polite">
        Showing {firstItem}–{lastItem} of {total}
      </span>
      <div className="pagination-actions">
        <button type="button" className="text-button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <span>Page {page} of {pageCount}</span>
        <button
          type="button"
          className="text-button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  )
}
