'use client';

import { toast } from '@/components/ui/toast';

interface RunMessages<T> {
  loading: string;
  success: string | ((value: T) => string);
  error: string;
}

function describe(error: unknown, fallback: string): string | undefined {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return message && message !== fallback ? message : undefined;
}

function success(title: string, description?: string): string {
  return toast.add({ type: 'success', title, description });
}

function failure(title: string, description?: string): string {
  const id: string = toast.add({
    type: 'error',
    title,
    description,
    priority: 'high',
    actionProps: {
      children: 'Dismiss',
      onClick() {
        toast.close(id);
      },
    },
  });

  return id;
}

function validation(messages: readonly string[]): string {
  const id: string = toast.add({
    type: 'warning',
    title: messages.length === 1 ? 'One field needs attention' : 'Some fields need attention',
    description: messages.join(' '),
    priority: 'high',
    actionProps: {
      children: 'Dismiss',
      onClick() {
        toast.close(id);
      },
    },
  });

  return id;
}


function run<T>(promise: Promise<T>, messages: RunMessages<T>): Promise<T | null> {
  return toast
    .promise(promise, {
      loading: messages.loading,
      success: (value) => ({
        title: typeof messages.success === 'function' ? messages.success(value) : messages.success,
      }),
      error: (error: unknown) => ({
        title: messages.error,
        description: describe(error, messages.error),
        priority: 'high',
      }),
    })
    .catch(() => null);
}

export const notify = { success, failure, validation, run } as const;
