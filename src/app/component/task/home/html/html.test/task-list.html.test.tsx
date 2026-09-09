import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { TaskListVm } from '@/app/model/task/view/task-list.vm';
import type { TaskRowVm } from '@/app/model/task/view/task-row.vm';
import { TaskListSection } from '../task-list.html';

function row(): TaskRowVm {
  return {
    id: 'task-1',
    title: 'Renew the library cards',
    description: 'No description.',
    icon: 'settings',
    severity: 'medium',
    severityLabel: 'Medium',
    statusModifier: 'todo',
    statusLabel: 'To do',
    statusIcon: 'clock',
    authorLabel: 'Unassigned',
    createdLabel: 'Sep 7, 2026, 2:55 PM',
    overdue: false,
    isDone: false,
    tags: [],
    detailPanel: null,
    editPanel: null,
    deletePanel: null,
    onOpen: vi.fn(),
    onKeyActivate: vi.fn(),
  };
}

function list(overrides: Partial<TaskListVm> = {}): TaskListVm {
  return {
    visible: true,
    rows: [row()],
    showSkeleton: false,
    loading: false,
    emptyMessage: 'No tasks found for this filter.',
    ...overrides,
  };
}

describe('TaskListSection', () => {
  it('renders the tasks while it is visible', () => {
    render(<TaskListSection list={list()} />);

    expect(screen.getByText('Renew the library cards')).toBeInTheDocument();
  });

  it('hides the whole list while a task is being created', () => {
    render(<TaskListSection list={list({ visible: false })} />);

    expect(screen.queryByText('Renew the library cards')).not.toBeInTheDocument();
    expect(screen.queryByText('No tasks found for this filter.')).not.toBeInTheDocument();
  });
});
