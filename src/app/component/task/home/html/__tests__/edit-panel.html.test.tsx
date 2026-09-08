import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EditPanelVm } from '@/app/model/task/view/edit-panel.vm';
import { EditPanelSection } from '../edit-panel.html';

function field(value: string) {
  return { value, onChange: vi.fn() };
}

function panel(overrides: Partial<EditPanelVm> = {}): EditPanelVm {
  return {
    submitLabel: 'Save changes',
    submitDisabled: false,
    errors: [],
    title: field('Add title for it'),
    description: field('adding a tile'),
    status: field('IN_PROGRESS'),
    priority: field('MEDIUM'),
    dueDate: field('2026-09-07T14:55'),
    assignee: field('Abebe'),
    tags: field('front urgent'),
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

describe('EditPanelSection', () => {
  it('pre-fills every field with the task as it currently stands', () => {
    render(<EditPanelSection panel={panel()} />);

    expect(screen.getByDisplayValue('Add title for it')).toBeInTheDocument();
    expect(screen.getByDisplayValue('adding a tile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Abebe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('front urgent')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /status/i })).toHaveValue('IN_PROGRESS');
  });

  it('records edits through the field handler', async () => {
    const title = field('Add title for it');
    const user = userEvent.setup();

    render(<EditPanelSection panel={panel({ title })} />);
    await user.type(screen.getByDisplayValue('Add title for it'), '!');

    expect(title.onChange).toHaveBeenCalled();
  });

  it('submits the form when Save changes is pressed', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const user = userEvent.setup();

    render(<EditPanelSection panel={panel({ onSubmit })} />);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('discards the edit when Cancel is pressed', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<EditPanelSection panel={panel({ onCancel })} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('blocks saving and shows the API messages when the patch was rejected', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <EditPanelSection
        panel={panel({
          onSubmit,
          submitDisabled: true,
          submitLabel: 'Saving…',
          errors: ['title should not be empty'],
        })}
      />,
    );

    expect(screen.getByText('title should not be empty')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Saving…' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
