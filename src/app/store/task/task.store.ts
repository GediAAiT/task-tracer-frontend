'use client';

import { useSyncExternalStore } from 'react';
import {
  TASK_STATUSES,
  type CreateTaskInput,
  type PaginationMeta,
  type Task,
  type TaskQuery,
  type TaskStats,
  type TaskStatus,
  type TaskTab,
  type UpdateTaskInput,
} from '@/app/model/task/task';
import type { CacheDiagnostics } from '@/app/model/task/cache';
import { HttpErrorResponse, NetworkError } from '@/app/service/http/http-client';
import { taskService } from '@/app/service/task/task.service';

interface TaskState {
  serverError: { name: string } | null;
  operationSuccess: boolean;
  loading: boolean;
  entities: Task[];
  meta: PaginationMeta | null;
  listCache: CacheDiagnostics | null;
  stats: TaskStats | null;
  query: TaskQuery;
  detailTaskId: string | null;
  selectedTask: Task | null;
  selectedLoading: boolean;
  updatingIds: readonly string[];
  creating: boolean;
  createErrors: readonly string[];
  editingTaskId: string | null;
  editErrors: readonly string[];
  deletingIds: readonly string[];
  deleteErrors: readonly string[];
}

const DEFAULT_QUERY: TaskQuery = { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' };

const EMPTY_STATUS_COUNTS = TASK_STATUSES.reduce(
  (counts, status) => ({ ...counts, [status]: 0 }),
  {} as Record<TaskStatus, number>,
);

const initialState: TaskState = {
  serverError: null,
  operationSuccess: false,
  loading: false,
  entities: [],
  meta: null,
  listCache: null,
  stats: null,
  query: DEFAULT_QUERY,
  detailTaskId: null,
  selectedTask: null,
  selectedLoading: false,
  updatingIds: [],
  creating: false,
  createErrors: [],
  editingTaskId: null,
  editErrors: [],
  deletingIds: [],
  deleteErrors: [],
};

let state: TaskState = initialState;
const listeners = new Set<() => void>();

function patchState(patch: Partial<TaskState>): void {
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
const getServerSnapshot = () => initialState;

function createGuard() {
  let generation = 0;
  return {
    next: () => ++generation,
    isStale: (value: number) => value !== generation,
  };
}

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

function updateServerError(err: unknown): void {
  let name = 'An unexpected error occurred';
  if (err instanceof HttpErrorResponse) name = err.messages.join(', ');
  else if (err instanceof NetworkError) name = err.message;
  else if (err instanceof Error) name = err.message;
  patchState({ serverError: { name }, operationSuccess: false });
}

function withoutId(ids: readonly string[], id: string): string[] {
  return ids.filter((pending) => pending !== id);
}

const listGuard = createGuard();
const statsGuard = createGuard();
const selectedGuard = createGuard();

let listController: AbortController | null = null;

async function getAllTasks(): Promise<void> {
  const generation = listGuard.next();
  listController?.abort();
  const controller = new AbortController();
  listController = controller;

  patchState({ loading: true, serverError: null });

  try {
    const { page, cache } = await taskService.getAllTasks(state.query, controller.signal);
    if (listGuard.isStale(generation)) return;
    patchState({
      entities: page.items,
      meta: page.meta,
      listCache: cache,
      loading: false,
      serverError: null,
    });
  } catch (err) {
    if (isAbort(err) || listGuard.isStale(generation)) return;
    updateServerError(err);
    patchState({ loading: false });
  }
}

async function getTaskStats(): Promise<void> {
  const generation = statsGuard.next();

  try {
    const stats = await taskService.getTaskStats();
    if (statsGuard.isStale(generation)) return;
    patchState({ stats });
  } catch (err) {
    if (isAbort(err) || statsGuard.isStale(generation)) return;
    updateServerError(err);
  }
}

async function refresh(): Promise<void> {
  await Promise.all([getAllTasks(), getTaskStats()]);
}

function applyQuery(patch: Partial<TaskQuery>): void {
  patchState({
    query: { ...state.query, ...patch },
    detailTaskId: null,
    selectedTask: null,
    editingTaskId: null,
    editErrors: [],
  });
  void getAllTasks();
}

function setTab(tab: TaskTab): void {
  applyQuery({ status: tab === 'ALL' ? undefined : tab, page: 1 });
}

function setSearch(term: string): void {
  const search = term.trim() || undefined;
  if (search === state.query.search) return;
  applyQuery({ search, page: 1 });
}

function goToPage(page: number): void {
  applyQuery({ page });
}

function closeTask(): void {
  if (state.detailTaskId === null && state.editingTaskId === null) return;
  selectedGuard.next();
  patchState({
    detailTaskId: null,
    editingTaskId: null,
    editErrors: [],
    selectedTask: null,
    selectedLoading: false,
  });
}

async function openTask(id: string): Promise<void> {
  const generation = selectedGuard.next();
  const fromList = state.entities.find((task) => task.id === id) ?? null;
  patchState({
    detailTaskId: id,
    editingTaskId: id,
    editErrors: [],
    selectedTask: fromList,
    selectedLoading: true,
  });

  try {
    const task = await taskService.getTaskById(id);
    if (selectedGuard.isStale(generation)) return;
    patchState({ selectedTask: task, selectedLoading: false });
  } catch (err) {
    if (isAbort(err) || selectedGuard.isStale(generation)) return;
    updateServerError(err);
    patchState({ selectedLoading: false });
  }
}

async function createTask(payload: CreateTaskInput): Promise<Task | null> {
  patchState({ creating: true, createErrors: [], operationSuccess: false, serverError: null });

  try {
    const task = await taskService.createTask(payload);
    patchState({ creating: false, createErrors: [], operationSuccess: true });
    await refresh();
    return task;
  } catch (err) {
    const createErrors =
      err instanceof HttpErrorResponse ? err.messages : ['Could not create the task.'];
    updateServerError(err);
    patchState({ creating: false, createErrors });
    return null;
  }
}

async function updateTask(id: string, payload: UpdateTaskInput): Promise<Task | null> {
  if (state.updatingIds.includes(id)) return null;
  const editing = state.editingTaskId === id;
  patchState({ updatingIds: [...state.updatingIds, id], serverError: null, editErrors: [] });

  try {
    const updated = await taskService.updateTask(id, payload);
    patchState({
      entities: state.entities.map((task) => (task.id === id ? updated : task)),
      selectedTask: state.selectedTask?.id === id ? updated : state.selectedTask,
      updatingIds: withoutId(state.updatingIds, id),
      editingTaskId: editing ? null : state.editingTaskId,
      detailTaskId: editing ? null : state.detailTaskId,
      selectedLoading: editing ? false : state.selectedLoading,
      operationSuccess: true,
    });
    void getTaskStats();
    return updated;
  } catch (err) {
    const messages =
      err instanceof HttpErrorResponse ? err.messages : ['Could not update the task.'];
    updateServerError(err);
    patchState({
      updatingIds: withoutId(state.updatingIds, id),
      editErrors: editing ? messages : state.editErrors,
    });
    return null;
  }
}

async function deleteTask(id: string): Promise<boolean> {
  if (state.deletingIds.includes(id)) return false;
  patchState({ deletingIds: [...state.deletingIds, id], serverError: null, deleteErrors: [] });

  try {
    await taskService.deleteTask(id);
    const wasEditing = state.editingTaskId === id;
    patchState({
      entities: state.entities.filter((task) => task.id !== id),
      deletingIds: withoutId(state.deletingIds, id),
      deleteErrors: [],
      detailTaskId: state.detailTaskId === id ? null : state.detailTaskId,
      selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
      editingTaskId: wasEditing ? null : state.editingTaskId,
      editErrors: wasEditing ? [] : state.editErrors,
      operationSuccess: true,
    });

    await refresh();

    // Removing the last row of a page would otherwise leave the list stranded on an empty page.
    const page = state.meta?.page ?? 1;
    if (state.entities.length === 0 && page > 1) applyQuery({ page: page - 1 });

    return true;
  } catch (err) {
    const deleteErrors =
      err instanceof HttpErrorResponse ? err.messages : ['Could not delete the task.'];
    updateServerError(err);
    patchState({ deletingIds: withoutId(state.deletingIds, id), deleteErrors });
    return false;
  }
}

function clearEditErrors(): void {
  if (state.editErrors.length > 0) patchState({ editErrors: [] });
}

function clearDeleteErrors(): void {
  if (state.deleteErrors.length > 0) patchState({ deleteErrors: [] });
}

function clearCreateErrors(): void {
  if (state.createErrors.length > 0) patchState({ createErrors: [] });
}

export const taskStoreMethods = {
  getAllTasks,
  getTaskStats,
  refresh,
  setTab,
  setSearch,
  goToPage,
  openTask,
  closeTask,
  createTask,
  updateTask,
  deleteTask,
  clearEditErrors,
  clearDeleteErrors,
  clearCreateErrors,
} as const;

export const taskStore = {
  getState: getSnapshot,
  subscribe,
  ...taskStoreMethods,
};

export interface TaskStoreView extends TaskState {
  allTasks: Task[];
  totalTasks: number;
  countByStatus: Record<TaskStatus, number>;
  overdueCount: number;
  completionRate: number;
  activeTab: TaskTab;
}

export function useTaskStore(): TaskStoreView {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { stats, query, entities } = snapshot;

  return {
    ...snapshot,
    allTasks: entities,
    totalTasks: stats?.total ?? 0,
    countByStatus: stats?.byStatus ?? EMPTY_STATUS_COUNTS,
    overdueCount: stats?.overdue ?? 0,
    completionRate: Math.round((stats?.completionRate ?? 0) * 100),
    activeTab: query.status ?? 'ALL',
  };
}

export function useTaskStoreMethods(): typeof taskStoreMethods {
  return taskStoreMethods;
}
