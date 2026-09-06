import type { ToolbarVm } from '@/app/model/task/view/toolbar.vm';

export function ToolbarSection({ toolbar }: { toolbar: ToolbarVm }) {
  return (
    <div className="toolbar">
      <input
        type="search"
        className="search-field"
        placeholder="Search by title or description"
        value={toolbar.search.value}
        onChange={toolbar.search.onChange}
      />
      <button type="button" className="new-task-btn" onClick={toolbar.onToggleCreate}>
        {toolbar.newTaskLabel}
      </button>
    </div>
  );
}
