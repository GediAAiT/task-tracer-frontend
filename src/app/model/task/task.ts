export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'dueDate',
  'priority',
  'title',
] as const;
export type TaskSortBy = (typeof TASK_SORT_FIELDS)[number];

export type SortOrder = 'asc' | 'desc';

export const TASK_TABS = ['ALL', ...TASK_STATUSES] as const;
export type TaskTab = (typeof TASK_TABS)[number];

export type TaskSeverity = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignee: string | null;
  tags: string[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignee?: string;
  tags?: string[];
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  tag?: string;
  search?: string;
  overdue?: boolean;
  page?: number;
  limit?: number;
  sortBy?: TaskSortBy;
  sortOrder?: SortOrder;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedTasks {
  items: Task[];
  meta: PaginationMeta;
}

export interface TaskStats {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
  completionRate: number;
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee: string;
  tags: string;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  BLOCKED: 'Blocked',
  DONE: 'Done',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const TASK_TAB_LABELS: Record<TaskTab, string> = {
  ALL: 'All',
  ...TASK_STATUS_LABELS,
};

export const TASK_PRIORITY_SEVERITY: Record<TaskPriority, TaskSeverity> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'high',
};

export const EMPTY_TASK_FORM: TaskFormValues = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
  assignee: '',
  tags: '',
};

export function isOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.status === 'DONE' || task.dueDate === null) return false;
  return new Date(task.dueDate).getTime() < now.getTime();
}

export function toTaskInput(values: TaskFormValues): CreateTaskInput {
  const input: CreateTaskInput = {
    title: values.title.trim(),
    status: values.status,
    priority: values.priority,
  };

  const description = values.description.trim();
  if (description) input.description = description;

  const assignee = values.assignee.trim();
  if (assignee) input.assignee = assignee;

  if (values.dueDate) {
    const parsed = new Date(values.dueDate);
    if (!Number.isNaN(parsed.getTime())) input.dueDate = parsed.toISOString();
  }

  const tags = Array.from(
    new Set(
      values.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
  if (tags.length > 0) input.tags = tags;

  return input;
}
