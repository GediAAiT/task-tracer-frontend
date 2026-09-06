import type {
  CreateTaskInput,
  PaginatedTasks,
  Task,
  TaskQuery,
  TaskStats,
  UpdateTaskInput,
} from '@/app/model/task/task';
import { httpClient } from '@/app/service/http/http-client';

const TASKS_PATH = '/tasks';

function taskPath(id: string): string {
  return `${TASKS_PATH}/${encodeURIComponent(id)}`;
}

export class TaskService {
  getAllTasks(query: TaskQuery = {}, signal?: AbortSignal): Promise<PaginatedTasks> {
    return httpClient.get<PaginatedTasks>(TASKS_PATH, { query: { ...query }, signal });
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
}

export const taskService = new TaskService();
