import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CreatePanelVm } from '@/app/model/task/view/create-panel.vm';
import { CreatePanelSection } from '../create-panel.html';

function field(value: string) {
  return { value, onChange: vi.fn() };
}

function panel(overrides: Partial<CreatePanelVm> = {}): CreatePanelVm {
  return {
    open: true,
    submitLabel: 'Create task',
    submitDisabled: false,
    errors: [],
    title: field('Renew the library cards'),
    description: field(''),
    status: field(''),
    priority: field(''),
    dueDate: field(''),
    assignee: field(''),
    tags: field(''),
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
    onOpenChange: vi.fn(),
    ...overrides,
  };
}

describe('CreatePanelSection', () => {
  it('offers only the trigger while the dialog is closed', () => {
    render(<CreatePanelSection panel={panel({ open: false })} />);

    expect(screen.getByRole('button', { name: 'New task' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('Renew the library cards')).not.toBeInTheDocument();
  });

  it('asks to open when the trigger is pressed', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(<CreatePanelSection panel={panel({ open: false, onOpenChange })} />);
    await user.click(screen.getByRole('button', { name: 'New task' }));

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('shows the task form inside the dialog once it is open', () => {
    render(<CreatePanelSection panel={panel()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByText('Fill in the details below. Title, status and priority are required.'),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Renew the library cards')).toBeInTheDocument();
  });

  it('submits the form from the dialog footer', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const user = userEvent.setup();

    render(<CreatePanelSection panel={panel({ onSubmit })} />);
    await user.click(screen.getByRole('button', { name: 'Create task' }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('discards the draft when Cancel is pressed', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<CreatePanelSection panel={panel({ onCancel })} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('offers the submit button even while required fields are empty', () => {
    render(<CreatePanelSection panel={panel({ title: field(''), submitDisabled: false })} />);

    expect(screen.getByRole('button', { name: 'Create task' })).toBeEnabled();
  });

  it('blocks creating and shows the API messages when the post was rejected', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <CreatePanelSection
        panel={panel({
          onSubmit,
          submitDisabled: true,
          submitLabel: 'Creating…',
          errors: ['title should not be empty'],
        })}
      />,
    );

    expect(screen.getByText('title should not be empty')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Creating…' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('asks to close when the dialog is dismissed with Escape', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(<CreatePanelSection panel={panel({ onOpenChange })} />);
    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });
});
