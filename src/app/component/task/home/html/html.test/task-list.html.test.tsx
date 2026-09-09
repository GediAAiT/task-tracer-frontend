import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { TaskListVm } from '@/app/model/task/view/task-list.vm';
import type { TaskRowVm } from '@/app/model/task/view/task-row.vm';
import { TaskListSection } from '../task-list.html';

function row(id = 'task-1', title = 'Renew the library cards'): TaskRowVm {
  return {
    id,
    title,
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
    taskPanel: null,
    deletePanel: null,
    onOpen: vi.fn(),
    onKeyActivate: vi.fn(),
  };
}

function list(overrides: Partial<TaskListVm> = {}): TaskListVm {
  return {
    visible: true,
    layout: 'cards',
    caption: 'Select a task to open its full details.',
    rows: [row()],
    showSkeleton: false,
    loading: false,
    emptyMessage: 'No tasks found for this filter.',
    ...overrides,
  };
}

function rows(count: number): TaskRowVm[] {
  return Array.from({ length: count }, (_, index) => row(`task-${index}`, `Task ${index}`));
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

  it('keeps the cards for a short list', () => {
    render(<TaskListSection list={list({ layout: 'cards', rows: rows(2) })} />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('switches to a table once the list outgrows the cards', () => {
    render(<TaskListSection list={list({ layout: 'table', rows: rows(3) })} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(screen.getByRole('columnheader', { name: 'Task' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Task 2' })).toBeInTheDocument();
    expect(
      screen.getByText('Select a task to open its full details.'),
    ).toBeInTheDocument();
  });

  it('shows the empty state instead of an empty table', () => {
    render(<TaskListSection list={list({ layout: 'table', rows: [] })} />);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('No tasks found for this filter.')).toBeInTheDocument();
  });
});
