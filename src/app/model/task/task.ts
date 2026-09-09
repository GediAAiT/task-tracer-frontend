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


export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assignee?: string | null;
  tags?: string[];
}

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
  /** Empty until the author picks one, so a missing choice can be reported. */
  status: TaskStatus | '';
  priority: TaskPriority | '';
  dueDate: string;
  assignee: string;
  tags: string;
}

export type TaskFormField = keyof TaskFormValues;

export type TaskFieldErrors = Partial<Record<TaskFormField, string>>;

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
  status: '',
  priority: '',
  dueDate: '',
  assignee: '',
  tags: '',
};

export const TASK_FORM_FIELDS: readonly TaskFormField[] = [
  'title',
  'description',
  'status',
  'priority',
  'dueDate',
  'assignee',
  'tags',
];

export const TASK_FORM_FIELD_LABELS: Record<TaskFormField, string> = {
  title: 'Title',
  description: 'Description',
  status: 'Status',
  priority: 'Priority',
  dueDate: 'Due date',
  assignee: 'Assignee',
  tags: 'Tags',
};

export const TITLE_MAX_LENGTH = 200;
export const DESCRIPTION_MAX_LENGTH = 2000;
export const ASSIGNEE_MAX_LENGTH = 120;
export const TAGS_MAX_COUNT = 20;
export const TAG_MAX_LENGTH = 40;

export function isOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.status === 'DONE' || task.dueDate === null) return false;
  return new Date(task.dueDate).getTime() < now.getTime();
}

function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

function parseDueDate(raw: string): string | null {
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function toDateTimeLocal(iso: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/**
 * Mirrors the API contract so a rejected write is explained on the field itself
 * rather than arriving as an opaque 400.
 */
export function validateTaskForm(values: TaskFormValues): TaskFieldErrors {
  const errors: TaskFieldErrors = {};

  const title = values.title.trim();
  if (!title) errors.title = 'Title is required.';
  else if (title.length > TITLE_MAX_LENGTH)
    errors.title = `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`;

  if (values.description.trim().length > DESCRIPTION_MAX_LENGTH)
    errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;

  if (!values.status) errors.status = 'Status is required. Pick where this task stands.';
  else if (!TASK_STATUSES.includes(values.status)) errors.status = 'Pick a status from the list.';

  if (!values.priority) errors.priority = 'Priority is required. Pick how urgent this task is.';
  else if (!TASK_PRIORITIES.includes(values.priority))
    errors.priority = 'Pick a priority from the list.';

  if (values.dueDate && Number.isNaN(new Date(values.dueDate).getTime()))
    errors.dueDate = 'Due date is not a valid date and time.';

  if (values.assignee.trim().length > ASSIGNEE_MAX_LENGTH)
    errors.assignee = `Assignee must be ${ASSIGNEE_MAX_LENGTH} characters or fewer.`;

  const tags = parseTags(values.tags);
  if (tags.length > TAGS_MAX_COUNT) errors.tags = `Use at most ${TAGS_MAX_COUNT} tags.`;
  else if (tags.some((tag) => tag.length > TAG_MAX_LENGTH))
    errors.tags = `Each tag must be ${TAG_MAX_LENGTH} characters or fewer.`;

  return errors;
}

export function hasFieldErrors(errors: TaskFieldErrors): boolean {
  return TASK_FORM_FIELDS.some((field) => errors[field] !== undefined);
}

export function listFieldErrors(errors: TaskFieldErrors): string[] {
  return TASK_FORM_FIELDS.map((field) => errors[field]).filter(
    (message): message is string => message !== undefined,
  );
}

export function clearFieldError(errors: TaskFieldErrors, field: TaskFormField): TaskFieldErrors {
  if (errors[field] === undefined) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}

export function toTaskInput(values: TaskFormValues): CreateTaskInput {
  const input: CreateTaskInput = { title: values.title.trim() };

  if (values.status) input.status = values.status;
  if (values.priority) input.priority = values.priority;

  const description = values.description.trim();
  if (description) input.description = description;

  const assignee = values.assignee.trim();
  if (assignee) input.assignee = assignee;

  const dueDate = parseDueDate(values.dueDate);
  if (dueDate) input.dueDate = dueDate;

  const tags = parseTags(values.tags);
  if (tags.length > 0) input.tags = tags;

  return input;
}

export function toFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    dueDate: toDateTimeLocal(task.dueDate),
    assignee: task.assignee ?? '',
    tags: task.tags.join(', '),
  };
}

export function toTaskUpdate(values: TaskFormValues): UpdateTaskInput {
  const update: UpdateTaskInput = {
    title: values.title.trim(),
    description: values.description.trim() || null,
    dueDate: parseDueDate(values.dueDate),
    assignee: values.assignee.trim() || null,
    tags: parseTags(values.tags),
  };

  if (values.status) update.status = values.status;
  if (values.priority) update.priority = values.priority;

  return update;
}
