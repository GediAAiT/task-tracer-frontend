import type { ReactNode } from 'react';
import type { ToolbarVm } from '@/app/model/task/view/toolbar.vm';

export function ToolbarSection({
  toolbar,
  children,
}: {
  toolbar: ToolbarVm;
  children: ReactNode;
}) {
  return (
    <div className="toolbar">
      <input
        type="search"
        className="search-field"
        placeholder="Search by title or description"
        value={toolbar.search.value}
        onChange={toolbar.search.onChange}
      />
      {children}
    </div>
  );
}
