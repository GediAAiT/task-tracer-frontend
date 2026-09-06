import type { TaskRowVm } from './task-row.vm';

export interface TaskListVm {
  rows: TaskRowVm[];
  showSkeleton: boolean;
  loading: boolean;
  emptyMessage: string;
}
