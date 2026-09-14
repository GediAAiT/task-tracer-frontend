'use client';

import { useEffect, useState } from 'react';
import {
  EMPTY_TASK_FORM,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_SEVERITY,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_TABS,
  TASK_TAB_LABELS,
  clearFieldError,
  hasFieldErrors,
  isOverdue,
  listFieldErrors,
  toFormValues,
  toTaskInput,
  toTaskUpdate,
  validateTaskForm,
  type Task,
  type TaskFieldErrors,
  type TaskFormValues,
  type TaskStatus,
} from '@/app/model/task/task';
import type { DeletePanelVm } from '@/app/model/task/view/delete-panel.vm';
import type { FieldVm, OptionVm } from '@/app/model/task/view/field.vm';
import type { StatCardVm } from '@/app/model/task/view/stat-card.vm';
import type { TabVm } from '@/app/model/task/view/tab.vm';
import type {
  ActionVm,
  DetailVm,
  RowIconName,
  StatusIconName,
  TaskPanelVm,
} from '@/app/model/task/view/task-panel.vm';
import type { TaskRowVm } from '@/app/model/task/view/task-row.vm';
import { notify } from '@/app/service/notification/notification.service';
import { useBackendConnection } from '@/app/store/health/health.store';
import { taskStore, useTaskStore, useTaskStoreMethods } from '@/app/store/task/task.store';
import './home.component.scss';
import { HomeTemplate } from './home.html';

interface Transition {
  status: TaskStatus;
  label: string;
  modifier: string;
}

const STATUS_TRANSITIONS: Record<TaskStatus, Transition[]> = {
  TODO: [
    { status: 'IN_PROGRESS', label: 'Start task', modifier: 'primary-btn' },
    { status: 'BLOCKED', label: 'Block', modifier: 'danger-btn' },
  ],
  IN_PROGRESS: [
    { status: 'DONE', label: 'Mark done', modifier: 'primary-btn' },
    { status: 'BLOCKED', label: 'Block', modifier: 'danger-btn' },
  ],
  BLOCKED: [
    { status: 'IN_PROGRESS', label: 'Unblock', modifier: 'primary-btn' },
    { status: 'TODO', label: 'Move to to do', modifier: 'neutral-btn' },
  ],
  DONE: [{ status: 'TODO', label: 'Reopen', modifier: 'neutral-btn' }],
};

const STATUS_ICONS: Record<TaskStatus, StatusIconName> = {
  TODO: 'clock',
  IN_PROGRESS: 'clock',
  BLOCKED: 'cross',
  DONE: 'check',
};

const TABLE_FROM = 3;

const ICON_KEYWORDS: [string[], RowIconName][] = [
  [['member', 'user'], 'user'],
  [['loan', 'payment'], 'card'],
  [['fine', 'money'], 'dollar'],
];

function toOptions<T extends string>(values: readonly T[], labels: Record<T, string>): OptionVm[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

function formatKey(key: string): string {
  const result = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
  return result.charAt(0).toUpperCase() + result.slice(1).trim();
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function pickIcon(task: Task): RowIconName {
  const haystack = [...task.tags, task.title].join(' ').toLowerCase();
  const match = ICON_KEYWORDS.find(([keywords]) =>
    keywords.some((keyword) => haystack.includes(keyword)),
  );
  return match ? match[1] : 'settings';
}

function buildDetails(task: Task): DetailVm[] {
  const entries: Record<string, string> = {
    createdAt: formatDate(task.createdAt),
    updatedAt: formatDate(task.updatedAt),
    completedAt: formatDate(task.completedAt),
  };

  return Object.entries(entries).map(([key, value]) => ({
    key,
    label: formatKey(key),
    value,
  }));
}

function failureReason(messages: readonly string[], fallback: string): string {
  if (messages.length > 0) return messages.join(' ');
  return taskStore.getState().serverError?.name ?? fallback;
}

export function HomeComponent() {
  const store = useTaskStore();
  const methods = useTaskStoreMethods();
  useBackendConnection();

  const [createOpen, setCreateOpen] = useState(false);
  const [values, setValues] = useState<TaskFormValues>(EMPTY_TASK_FORM);
  const [createFieldErrors, setCreateFieldErrors] = useState<TaskFieldErrors>({});
  const [editValues, setEditValues] = useState<TaskFormValues | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<TaskFieldErrors>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void methods.refresh();
  }, [methods]);

  useEffect(() => {
    const timer = setTimeout(() => methods.setSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search, methods]);


  function field(key: keyof TaskFormValues): FieldVm {
    return {
      value: values[key],
      error: createFieldErrors[key] ?? null,
      onChange: (event) => {
        const next = event.target.value;
        setValues((previous) => ({ ...previous, [key]: next }));
        setCreateFieldErrors((previous) => clearFieldError(previous, key));
        methods.clearCreateErrors();
      },
    };
  }

  function closeCreatePanel() {
    setCreateOpen(false);
    setValues(EMPTY_TASK_FORM);
    setCreateFieldErrors({});
    methods.clearCreateErrors();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fieldErrors = validateTaskForm(values);
    setCreateFieldErrors(fieldErrors);
    if (hasFieldErrors(fieldErrors)) {
      notify.validation(listFieldErrors(fieldErrors));
      return;
    }

    const created = await notify.run(
      methods.createTask(toTaskInput(values)).then((task) => {
        if (!task) {
          throw new Error(
            failureReason(taskStore.getState().createErrors, 'The API rejected the new task.'),
          );
        }
        return task;
      }),
      {
        loading: 'Creating task…',
        success: (task) => `“${task.title}” was created.`,
        error: 'Could not create the task',
      },
    );

    if (created) {
      setValues(EMPTY_TASK_FORM);
      setCreateFieldErrors({});
      setCreateOpen(false);
    }
  }

  function editField(key: keyof TaskFormValues): FieldVm {
    return {
      value: editValues?.[key] ?? '',
      error: editFieldErrors[key] ?? null,
      onChange: (event) => {
        const next = event.target.value;
        setEditValues((previous) => (previous ? { ...previous, [key]: next } : previous));
        setEditFieldErrors((previous) => clearFieldError(previous, key));
        methods.clearEditErrors();
      },
    };
  }

  function openTaskPanel(task: Task) {
    setEditValues(toFormValues(task));
    setEditFieldErrors({});
    void methods.openTask(task.id);
  }

  function closeTaskPanel() {
    setEditValues(null);
    setEditFieldErrors({});
    methods.closeTask();
  }

  function startDeleting(id: string) {
    methods.clearDeleteErrors();
    closeTaskPanel();
    setDeletingId(id);
  }

  function cancelDeleting() {
    setDeletingId(null);
    methods.clearDeleteErrors();
  }

  async function handleDeleteConfirm(id: string, title: string) {
    const removed = await notify.run(
      methods.deleteTask(id).then((ok) => {
        if (!ok) {
          throw new Error(
            failureReason(taskStore.getState().deleteErrors, 'The API rejected the delete.'),
          );
        }
        return title;
      }),
      {
        loading: 'Deleting task…',
        success: (name) => `“${name}” was deleted.`,
        error: 'Could not delete the task',
      },
    );

    if (removed) setDeletingId(null);
  }

  async function handleTaskSubmit(id: string, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editValues) return;

    const fieldErrors = validateTaskForm(editValues);
    setEditFieldErrors(fieldErrors);
    if (hasFieldErrors(fieldErrors)) {
      notify.validation(listFieldErrors(fieldErrors));
      return;
    }

    const updated = await notify.run(
      methods.updateTask(id, toTaskUpdate(editValues)).then((task) => {
        if (!task) {
          throw new Error(
            failureReason(taskStore.getState().editErrors, 'The API rejected the changes.'),
          );
        }
        return task;
      }),
      {
        loading: 'Saving changes…',
        success: (task) => `“${task.title}” was updated.`,
        error: 'Could not save the changes',
      },
    );

    if (updated) {
      setEditValues(null);
      setEditFieldErrors({});
    }
  }

  async function changeStatus(id: string, status: TaskStatus) {
    const updated = await notify.run(
      methods.updateTask(id, { status }).then((task) => {
        if (!task) {
          throw new Error(
            failureReason(taskStore.getState().editErrors, 'The API rejected the change.'),
          );
        }
        return task;
      }),
      {
        loading: 'Updating status…',
        success: (task) => `Moved to ${TASK_STATUS_LABELS[task.status]}.`,
        error: 'Could not update the status',
      },
    );

    if (updated) {
      setEditValues(null);
      setEditFieldErrors({});
    }
  }

  async function handleRetry() {
    await notify.run(
      methods.refresh().then(() => {
        const { serverError } = taskStore.getState();
        if (serverError) throw new Error(serverError.name);
      }),
      {
        loading: 'Reloading tasks…',
        success: 'Tasks reloaded.',
        error: 'Could not reload the tasks',
      },
    );
  }

  const statCards: StatCardVm[] = TASK_STATUSES.map((status) => ({
    key: status,
    label: TASK_STATUS_LABELS[status].toUpperCase(),
    value: store.countByStatus[status],
    modifier: `${status.toLowerCase()}-card`,
  }));

  const tabs: TabVm[] = TASK_TABS.map((tab) => ({
    key: tab,
    label: TASK_TAB_LABELS[tab],
    count: tab === 'ALL' ? store.totalTasks : store.countByStatus[tab],
    active: store.activeTab === tab,
    onSelect: () => methods.setTab(tab),
  }));

  const statusOptions = toOptions(TASK_STATUSES, TASK_STATUS_LABELS);
  const priorityOptions = toOptions(TASK_PRIORITIES, TASK_PRIORITY_LABELS);

  const rows: TaskRowVm[] = store.allTasks.map((task) => {
    const showingPanel = store.detailTaskId === task.id;
    const current =
      showingPanel && store.selectedTask?.id === task.id ? store.selectedTask : task;
    const saving = store.updatingIds.includes(task.id);
    const deleting = store.deletingIds.includes(task.id);

    const actions: ActionVm[] = STATUS_TRANSITIONS[current.status].map((transition) => ({
      key: transition.status,
      label: transition.label,
      modifier: transition.modifier,
      disabled: saving || deleting,
      onSelect: () => void changeStatus(task.id, transition.status),
    }));

    actions.push({
      key: 'DELETE',
      label: deleting ? 'Deleting…' : 'Delete',
      modifier: 'danger-btn',
      disabled: saving || deleting,
      onSelect: () => startDeleting(task.id),
    });

    const taskPanel: TaskPanelVm | null =
      showingPanel && editValues !== null
        ? {
            open: true,
            onOpenChange: (open) => {
              if (!open) closeTaskPanel();
            },
            heading: current.title,
            icon: pickIcon(current),
            severity: TASK_PRIORITY_SEVERITY[current.priority],
            severityLabel: TASK_PRIORITY_LABELS[current.priority],
            statusModifier: current.status.toLowerCase(),
            statusLabel: TASK_STATUS_LABELS[current.status],
            statusIcon: STATUS_ICONS[current.status],
            overdue: isOverdue(current),
            isDone: current.status === 'DONE',
            loading: store.selectedLoading,
            details: buildDetails(current),
            actions,
            submitLabel: saving ? 'Saving…' : 'Save changes',
            submitDisabled: saving,
            errors: store.editErrors,
            title: editField('title'),
            description: editField('description'),
            status: editField('status'),
            priority: editField('priority'),
            dueDate: editField('dueDate'),
            assignee: editField('assignee'),
            tags: editField('tags'),
            statusOptions,
            priorityOptions,
            onSubmit: (event) => void handleTaskSubmit(task.id, event),
            onCancel: closeTaskPanel,
          }
        : null;

    const deletePanel: DeletePanelVm | null =
      deletingId === task.id
        ? {
            open: true,
            onOpenChange: (open) => {
              if (!open) cancelDeleting();
            },
            taskTitle: current.title,
            confirmLabel: deleting ? 'Deleting…' : 'Delete task',
            confirmDisabled: deleting,
            errors: store.deleteErrors,
            onConfirm: () => void handleDeleteConfirm(task.id, current.title),
            onCancel: cancelDeleting,
          }
        : null;

    return {
      id: task.id,
      title: current.title,
      description: current.description ?? 'No description.',
      icon: pickIcon(current),
      severity: TASK_PRIORITY_SEVERITY[current.priority],
      severityLabel: TASK_PRIORITY_LABELS[current.priority],
      statusModifier: current.status.toLowerCase(),
      statusLabel: TASK_STATUS_LABELS[current.status],
      statusIcon: STATUS_ICONS[current.status],
      authorLabel: current.assignee ?? 'Unassigned',
      createdLabel: formatDate(current.createdAt),
      overdue: isOverdue(current),
      isDone: current.status === 'DONE',
      tags: current.tags,
      taskPanel,
      deletePanel,
      onOpen: () => openTaskPanel(task),
      onKeyActivate: (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openTaskPanel(task);
      },
    };
  });

  const meta = store.meta;
  const firstOnPage = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const lastOnPage = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <HomeTemplate
      banner={{ totalTasks: store.totalTasks, completionRate: store.completionRate }}
      subtitle={`${store.countByStatus.TODO} to do and ${store.overdueCount} overdue across all tasks`}
      statCards={statCards}
      tabs={tabs}
      toolbar={{
        search: { value: search, onChange: (event) => setSearch(event.target.value) },
      }}
      createPanel={{
        open: createOpen,
        onOpenChange: (open) => (open ? setCreateOpen(true) : closeCreatePanel()),
        submitLabel: store.creating ? 'Creating…' : 'Create task',
        submitDisabled: store.creating,
        errors: store.createErrors,
        title: field('title'),
        description: field('description'),
        status: field('status'),
        priority: field('priority'),
        dueDate: field('dueDate'),
        assignee: field('assignee'),
        tags: field('tags'),
        statusOptions,
        priorityOptions,
        onSubmit: handleSubmit,
        onCancel: closeCreatePanel,
      }}
      feedback={{
        serverError: store.serverError?.name ?? null,
        retryDisabled: store.loading,
        onRetry: () => void handleRetry(),
      }}
      list={{
        visible: !createOpen,
        layout:
          Math.max(store.totalTasks, rows.length) >= TABLE_FROM ? 'table' : 'cards',
        caption: 'Select a task to open its full details.',
        rows,
        showSkeleton: store.loading && store.allTasks.length === 0,
        loading: store.loading && store.allTasks.length > 0,
        emptyMessage: 'No tasks found for this filter.',
      }}
      pagination={{
        visible: !createOpen && meta !== null && meta.total > 0,
        info: meta ? `Showing ${firstOnPage}–${lastOnPage} of ${meta.total}` : '',
        position: meta ? `${meta.page} / ${meta.totalPages}` : '',
        previousDisabled: !meta?.hasPreviousPage,
        nextDisabled: !meta?.hasNextPage,
        onPrevious: () => meta && methods.goToPage(meta.page - 1),
        onNext: () => meta && methods.goToPage(meta.page + 1),
      }}
    />
  );
}
