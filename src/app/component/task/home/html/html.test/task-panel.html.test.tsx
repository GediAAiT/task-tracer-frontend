import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FieldVm } from '@/app/model/task/view/field.vm';
import type { TaskPanelVm } from '@/app/model/task/view/task-panel.vm';
import { TaskPanelSection } from '../task-panel.html';

function field(value: string, error: string | null = null): FieldVm {
  return { value, error, onChange: vi.fn() };
}

function panel(overrides: Partial<TaskPanelVm> = {}): TaskPanelVm {
  return {
    open: true,
    onOpenChange: vi.fn(),
    heading: 'Renew the library cards',
    icon: 'settings',
    severity: 'medium',
    severityLabel: 'Medium',
    statusModifier: 'todo',
    statusLabel: 'To do',
    statusIcon: 'clock',
    overdue: false,
    isDone: false,
    loading: false,
    details: [
      { key: 'createdAt', label: 'Created at', value: 'Sep 7, 2026, 2:55 PM' },
      { key: 'updatedAt', label: 'Updated at', value: 'Sep 8, 2026, 9:20 PM' },
    ],
    actions: [
      {
        key: 'IN_PROGRESS',
        label: 'Start task',
        modifier: 'primary-btn',
        disabled: false,
        onSelect: vi.fn(),
      },
      {
        key: 'DELETE',
        label: 'Delete',
        modifier: 'danger-btn',
        disabled: false,
        onSelect: vi.fn(),
      },
    ],
    submitLabel: 'Save changes',
    submitDisabled: false,
    errors: [],
    title: field('Renew the library cards'),
    description: field('Every card issued before March needs a new expiry date.'),
    status: field('TODO'),
    priority: field('MEDIUM'),
    dueDate: field('2026-09-10T21:20'),
    assignee: field('Abebe'),
    tags: field('backend, urgent'),
    statusOptions: [
      { value: 'TODO', label: 'To do' },
      { value: 'IN_PROGRESS', label: 'In progress' },
    ],
    priorityOptions: [
      { value: 'LOW', label: 'Low' },
      { value: 'MEDIUM', label: 'Medium' },
    ],
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

describe('TaskPanelSection', () => {
  it('shows the task as input fields already holding its values', () => {
    render(<TaskPanelSection panel={panel()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Renew the library cards' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue(
      'Renew the library cards',
    );
    expect(
      screen.getByDisplayValue('Every card issued before March needs a new expiry date.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /status/i })).toHaveValue('TODO');
    expect(screen.getByRole('combobox', { name: /priority/i })).toHaveValue('MEDIUM');
    expect(screen.getByDisplayValue('Abebe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('backend, urgent')).toBeInTheDocument();
  });

  it('keeps the timestamps read-only alongside the form', () => {
    render(<TaskPanelSection panel={panel()} />);

    expect(screen.getByText('TASK HISTORY')).toBeInTheDocument();
    expect(screen.getByText('Sep 7, 2026, 2:55 PM')).toBeInTheDocument();
  });

  it('stays closed until a task is opened', () => {
    render(<TaskPanelSection panel={panel({ open: false })} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('records edits through the field handler', async () => {
    const title = field('Renew the library cards');
    const user = userEvent.setup();

    render(<TaskPanelSection panel={panel({ title })} />);
    await user.type(screen.getByRole('textbox', { name: /title/i }), '!');

    expect(title.onChange).toHaveBeenCalled();
  });

  it('saves the form from the dialog footer', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const user = userEvent.setup();

    render(<TaskPanelSection panel={panel({ onSubmit })} />);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('runs a task action without submitting the form', async () => {
    const onSubmit = vi.fn();
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <TaskPanelSection
        panel={panel({
          onSubmit,
          actions: [
            {
              key: 'IN_PROGRESS',
              label: 'Start task',
              modifier: 'primary-btn',
              disabled: false,
              onSelect,
            },
          ],
        })}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Start task' }));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('closes the dialog when Cancel is pressed', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<TaskPanelSection panel={panel({ onCancel })} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('closes the dialog when it is dismissed', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(<TaskPanelSection panel={panel({ onOpenChange })} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
  });

  it('explains a rejected save on the field and in the summary', () => {
    render(
      <TaskPanelSection
        panel={panel({
          title: field('', 'Title is required.'),
          submitLabel: 'Saving…',
          submitDisabled: true,
          errors: ['title should not be empty'],
        })}
      />,
    );

    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('title should not be empty')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });

  it('flags an overdue task and a pending refresh', () => {
    render(<TaskPanelSection panel={panel({ overdue: true, loading: true })} />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing this task…');
  });
});
