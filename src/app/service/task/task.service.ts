import type {
  CreateTaskInput,
  PaginatedTasks,
  Task,
  TaskQuery,
  TaskStats,
  UpdateTaskInput,
} from '@/app/model/task/task';
import { readCacheDiagnostics, type CacheDiagnostics } from '@/app/model/task/cache';
import { httpClient } from '@/app/service/http/http-client';

const TASKS_PATH = '/tasks';

export interface TaskListResult {
  page: PaginatedTasks;
  cache: CacheDiagnostics;
}

function taskPath(id: string): string {
  return `${TASKS_PATH}/${encodeURIComponent(id)}`;
}

export class TaskService {
  async getAllTasks(query: TaskQuery = {}, signal?: AbortSignal): Promise<TaskListResult> {
    const { data, headers } = await httpClient.getWithHeaders<PaginatedTasks>(TASKS_PATH, {
      query: { ...query },
      signal,
    });

    return { page: data, cache: readCacheDiagnostics(headers) };
  }

  getTaskStats(signal?: AbortSignal): Promise<TaskStats> {
    return httpClient.get<TaskStats>(`${TASKS_PATH}/stats`, { signal });
  }

  getTaskById(id: string, signal?: AbortSignal): Promise<Task> {
    return httpClient.get<Task>(taskPath(id), { signal });
  }

  createTask(payload: CreateTaskInput, signal?: AbortSignal): Promise<Task> {
    return httpClient.post<Task>(TASKS_PATH, payload, { signal });
  }

  updateTask(id: string, payload: UpdateTaskInput, signal?: AbortSignal): Promise<Task> {
    return httpClient.patch<Task>(taskPath(id), payload, { signal });
  }

  deleteTask(id: string, signal?: AbortSignal): Promise<void> {
    return httpClient.delete<void>(taskPath(id), { signal });
  }
}

export const taskService = new TaskService();
