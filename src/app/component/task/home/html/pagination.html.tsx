import type { PaginationVm } from '@/app/model/task/view/pagination.vm';

export function PaginationSection({ pagination }: { pagination: PaginationVm }) {
  if (!pagination.visible) return null;

  return (
    <div className="pagination">
      <p className="page-info">{pagination.info}</p>
      <div className="page-controls">
        <button
          type="button"
          className="page-btn"
          disabled={pagination.previousDisabled}
          onClick={pagination.onPrevious}
        >
          Previous
        </button>
        <span className="page-position">{pagination.position}</span>
        <button
          type="button"
          className="page-btn"
          disabled={pagination.nextDisabled}
          onClick={pagination.onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
