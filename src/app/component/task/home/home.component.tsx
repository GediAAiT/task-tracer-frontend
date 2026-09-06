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
  isOverdue,
  toTaskInput,
  type Task,
  type TaskFormValues,
  type TaskStatus,
} from '@/app/model/task/task';
import type { OptionVm } from '@/app/model/task/view/field.vm';
import type { StatCardVm } from '@/app/model/task/view/stat-card.vm';
import type { TabVm } from '@/app/model/task/view/tab.vm';
import type {
  ActionVm,
  DetailVm,
  RowIconName,
  StatusIconName,
  TaskRowVm,
} from '@/app/model/task/view/task-row.vm';
import { useTaskStore, useTaskStoreMethods } from '@/app/store/task/task.store';
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
    assignee: task.assignee ?? 'Unassigned',
    priority: TASK_PRIORITY_LABELS[task.priority],
    status: TASK_STATUS_LABELS[task.status],
    dueDate: formatDate(task.dueDate),
    completedAt: formatDate(task.completedAt),
    createdAt: formatDate(task.createdAt),
    updatedAt: formatDate(task.updatedAt),
    tags: task.tags.length > 0 ? task.tags.join(', ') : '—',
  };

  return Object.entries(entries).map(([key, value]) => ({
    key,
    label: formatKey(key),
    value,
  }));
}

export function HomeComponent() {
  const store = useTaskStore();
  const methods = useTaskStoreMethods();

  const [createOpen, setCreateOpen] = useState(false);
  const [values, setValues] = useState<TaskFormValues>(EMPTY_TASK_FORM);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void methods.refresh();
  }, [methods]);

  useEffect(() => {
    const timer = setTimeout(() => methods.setSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search, methods]);

  function field(key: keyof TaskFormValues) {
    return {
      value: values[key],
      onChange: (event: { target: { value: string } }) => {
        const next = event.target.value;
        setValues((previous) => ({ ...previous, [key]: next }));
        methods.clearCreateErrors();
      },
    };
  }

  function closeCreatePanel() {
    setCreateOpen(false);
    setValues(EMPTY_TASK_FORM);
    methods.clearCreateErrors();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const created = await methods.createTask(toTaskInput(values));
    if (created) {
      setValues(EMPTY_TASK_FORM);
      setCreateOpen(false);
    }
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

  const rows: TaskRowVm[] = store.allTasks.map((task) => {
    const expanded = store.expandedTaskId === task.id;
    const current = expanded && store.selectedTask?.id === task.id ? store.selectedTask : task;
    const disabled = store.updatingIds.includes(task.id);

    const actions: ActionVm[] = STATUS_TRANSITIONS[current.status].map((transition) => ({
      key: transition.status,
      label: transition.label,
      modifier: transition.modifier,
      disabled,
      onSelect: () => void methods.updateTask(task.id, { status: transition.status }),
    }));

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
      expanded,
      details: buildDetails(current),
      actions,
      onToggle: () => void methods.toggleAccordion(task.id),
      onKeyActivate: (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        void methods.toggleAccordion(task.id);
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
        newTaskLabel: createOpen ? 'Close form' : 'New task',
        onToggleCreate: () => (createOpen ? closeCreatePanel() : setCreateOpen(true)),
      }}
      createPanel={{
        open: createOpen,
        submitLabel: store.creating ? 'Creating…' : 'Create task',
        submitDisabled: store.creating || values.title.trim() === '',
        errors: store.createErrors,
        title: field('title'),
        description: field('description'),
        status: field('status'),
        priority: field('priority'),
        dueDate: field('dueDate'),
        assignee: field('assignee'),
        tags: field('tags'),
        statusOptions: toOptions(TASK_STATUSES, TASK_STATUS_LABELS),
        priorityOptions: toOptions(TASK_PRIORITIES, TASK_PRIORITY_LABELS),
        onSubmit: handleSubmit,
        onCancel: closeCreatePanel,
      }}
      feedback={{
        serverError: store.serverError?.name ?? null,
        onRetry: () => void methods.refresh(),
      }}
      list={{
        rows,
        showSkeleton: store.loading && store.allTasks.length === 0,
        loading: store.loading && store.allTasks.length > 0,
        emptyMessage: 'No tasks found for this filter.',
      }}
      pagination={{
        visible: meta !== null && meta.total > 0,
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
