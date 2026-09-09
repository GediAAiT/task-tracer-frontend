import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TaskRowVm } from '@/app/model/task/view/task-row.vm';
import { TaskTableSection } from '../task-table.html';

function row(overrides: Partial<TaskRowVm> = {}): TaskRowVm {
  return {
    id: 'task-1',
    title: 'Renew the library cards',
    description: 'Every card issued before March needs a new expiry date.',
    icon: 'settings',
    severity: 'medium',
    severityLabel: 'Medium',
    statusModifier: 'todo',
    statusLabel: 'To do',
    statusIcon: 'clock',
    authorLabel: 'Abebe',
    createdLabel: 'Sep 7, 2026, 2:55 PM',
    overdue: false,
    isDone: false,
    tags: [],
    taskPanel: null,
    deletePanel: null,
    onOpen: vi.fn(),
    onKeyActivate: vi.fn(),
    ...overrides,
  };
}

const CAPTION = 'Select a task to open its full details.';

describe('TaskTableSection', () => {
  it('lays every column of a task out on one row', () => {
    render(<TaskTableSection rows={[row()]} caption={CAPTION} />);

    expect(screen.getByRole('button', { name: 'Renew the library cards' })).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('To do')).toBeInTheDocument();
    expect(screen.getByText('Abebe')).toBeInTheDocument();
    expect(screen.getByText('Sep 7, 2026, 2:55 PM')).toBeInTheDocument();
  });

  it('opens the task dialog from the task name', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();

    render(<TaskTableSection rows={[row({ onOpen })]} caption={CAPTION} />);
    await user.click(screen.getByRole('button', { name: 'Renew the library cards' }));

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('opens the task dialog from anywhere on the row', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();

    render(<TaskTableSection rows={[row({ onOpen })]} caption={CAPTION} />);
    await user.click(screen.getByText('Sep 7, 2026, 2:55 PM'));

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('flags an overdue task in its own row', () => {
    render(<TaskTableSection rows={[row({ overdue: true })]} caption={CAPTION} />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('renders the dialogs a row owns', () => {
    render(
      <TaskTableSection
        rows={[
          row({
            deletePanel: {
              open: true,
              onOpenChange: vi.fn(),
              taskTitle: 'Renew the library cards',
              confirmLabel: 'Delete task',
              confirmDisabled: false,
              errors: [],
              onConfirm: vi.fn(),
              onCancel: vi.fn(),
            },
          }),
        ]}
        caption={CAPTION}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Delete task' })).toBeInTheDocument();
  });
});
