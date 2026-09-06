import type { TaskListVm } from '@/app/model/task/view/task-list.vm';
import { EmptyIcon } from './icons.html';
import { TaskRowSection } from './task-row.html';

export function TaskListSection({ list }: { list: TaskListVm }) {
  return (
    <div className={list.loading ? 'tasks-list is-loading' : 'tasks-list'}>
      {list.showSkeleton && (
        <>
          <div className="skeleton-row" aria-hidden></div>
          <div className="skeleton-row" aria-hidden></div>
          <div className="skeleton-row" aria-hidden></div>
        </>
      )}

      {list.rows.map((row) => (
        <TaskRowSection key={row.id} row={row} />
      ))}

      {list.rows.length === 0 && !list.showSkeleton && (
        <div className="empty-state">
          <EmptyIcon />
          <p>{list.emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
