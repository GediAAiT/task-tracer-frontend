import type { TaskRowVm } from './task-row.vm';

export interface TaskListVm {
  visible: boolean;
  rows: TaskRowVm[];
  showSkeleton: boolean;
  loading: boolean;
  emptyMessage: string;
}
