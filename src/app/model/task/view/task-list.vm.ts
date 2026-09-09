import type { TaskRowVm } from './task-row.vm';

export type TaskListLayout = 'cards' | 'table';

export interface TaskListVm {
  visible: boolean;
  layout: TaskListLayout;
  caption: string;
  rows: TaskRowVm[];
  showSkeleton: boolean;
  loading: boolean;
  emptyMessage: string;
}
