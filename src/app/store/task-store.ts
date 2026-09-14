'use client';
import { useSyncExternalStore } from 'react';
import type {
  CreateTaskInput,
  PaginationMeta,
  Task,
  TaskQuery,
  TaskStats,
  UpdateTaskInput,
} from '@/app/model/task/task';
import { HttpErrorResponse, NetworkError } from '@/app/service/http/http-client';
import { taskService } from '@/app/service/task/task.service';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface TaskState {
  items: Task[];
  meta: PaginationMeta | null;
  listStatus: LoadStatus;
  listError: string | null;

  stats: TaskStats | null;
  statsStatus: LoadStatus;
  statsError: string | null;
  query: TaskQuery;

  updatingIds: readonly string[];

  creating: boolean;
  createErrors: readonly string[];

  detail: Task | null;
  detailStatus: LoadStatus;
  detailError: string | null;
}

const DEFAULT_QUERY: TaskQuery = { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' };

const INITIAL_STATE: TaskState = {
  items: [],
  meta: null,
  listStatus: 'idle',
  listError: null,
  stats: null,
  statsStatus: 'idle',
  statsError: null,
  query: DEFAULT_QUERY,
  updatingIds: [],
  creating: false,
  createErrors: [],
  detail: null,
  detailStatus: 'idle',
  detailError: null,
};

let state: TaskState = INITIAL_STATE;
const listeners = new Set<() => void>();

function setState(patch: Partial<TaskState>): void {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => INITIAL_STATE;

function describe(error: unknown): string {
  if (error instanceof HttpErrorResponse) return error.messages.join(', ');
  if (error instanceof NetworkError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong.';
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

let listGeneration = 0;
let listController: AbortController | null = null;

async function loadTasks(): Promise<void> {
  const generation = ++listGeneration;
  listController?.abort();
  const controller = new AbortController();
  listController = controller;

  setState({ listStatus: 'loading', listError: null });

  try {
    const page = await taskService.getAllTasks(state.query, controller.signal);
    if (generation !== listGeneration) return;
    setState({
      items: page.items,
      meta: page.meta,
      listStatus: 'ready',
      listError: null,
    });
  } catch (error) {

    if (isAbort(error) || generation !== listGeneration) return;
    setState({ listStatus: 'error', listError: describe(error) });
  }
}

let statsGeneration = 0;
async function loadStats(): Promise<void> {
  const generation = ++statsGeneration;
  setState({ statsStatus: 'loading', statsError: null });

  try {
    const stats = await taskService.getTaskStats();
    if (generation !== statsGeneration) return;
    setState({ stats, statsStatus: 'ready', statsError: null });
  } catch (error) {
    if (isAbort(error) || generation !== statsGeneration) return;
    setState({ statsStatus: 'error', statsError: describe(error) });
  }
}

async function refresh(): Promise<void> {
  await Promise.all([loadTasks(), loadStats()]);
}

function setQuery(patch: Partial<TaskQuery>): void {
  const isPageChange = 'page' in patch && Object.keys(patch).length === 1;
  const query: TaskQuery = { ...state.query, ...patch };
  if (!isPageChange) query.page = 1;
  setState({ query });
  void loadTasks();
}

function clearFilters(): void {
  setState({ query: DEFAULT_QUERY });
  void loadTasks();
}

function goToPage(page: number): void {
  setQuery({ page });
}

async function createTask(input: CreateTaskInput): Promise<Task | null> {
  setState({ creating: true, createErrors: [] });
  try {
    const task = await taskService.createTask(input);
    setState({ creating: false, createErrors: [] });
    await refresh();
    return task;
  } catch (error) {
    const errors = error instanceof HttpErrorResponse ? error.messages : [describe(error)];
    setState({ creating: false, createErrors: errors });
    return null;
  }
}

async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
  if (state.updatingIds.includes(id)) return null;
  setState({ updatingIds: [...state.updatingIds, id], listError: null });

  try {
    const updated = await taskService.updateTask(id, input);
    setState({
      items: state.items.map((task) => (task.id === id ? updated : task)),
      detail: state.detail?.id === id ? updated : state.detail,
      updatingIds: state.updatingIds.filter((pending) => pending !== id),
    });
    void loadStats();
    return updated;
  } catch (error) {
    setState({
      updatingIds: state.updatingIds.filter((pending) => pending !== id),
      listError: describe(error),
    });
    return null;
  }
}

let detailGeneration = 0;

async function loadTask(id: string): Promise<void> {
  const generation = ++detailGeneration;
  setState({
    detailStatus: 'loading',
    detailError: null,
    detail: state.detail?.id === id ? state.detail : null,
  });

  try {
    const task = await taskService.getTaskById(id);
    if (generation !== detailGeneration) return;
    setState({ detail: task, detailStatus: 'ready', detailError: null });
  } catch (error) {
    if (isAbort(error) || generation !== detailGeneration) return;
    setState({ detail: null, detailStatus: 'error', detailError: describe(error) });
  }
}

function clearCreateErrors(): void {
  if (state.createErrors.length > 0) setState({ createErrors: [] });
}

export const taskActions = {
  refresh,
  loadTasks,
  loadStats,
  loadTask,
  setQuery,
  clearFilters,
  goToPage,
  createTask,
  updateTask,
  clearCreateErrors,
} as const;

export const taskStore = {
  getState: getSnapshot,
  subscribe,
  actions: taskActions,
};

export function useTaskStore(): TaskState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useTaskActions(): typeof taskActions {
  return taskActions;
}
