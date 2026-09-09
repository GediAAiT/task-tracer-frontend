import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DeletePanelVm } from '@/app/model/task/view/delete-panel.vm';
import { DeletePanelSection } from '../delete-panel.html';

function panel(overrides: Partial<DeletePanelVm> = {}): DeletePanelVm {
  return {
    open: true,
    onOpenChange: vi.fn(),
    taskTitle: 'Add title for it',
    confirmLabel: 'Delete task',
    confirmDisabled: false,
    errors: [],
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  };
}

describe('DeletePanelSection', () => {
  it('asks for confirmation and names the task being removed', () => {
    render(<DeletePanelSection panel={panel()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Delete task' })).toBeInTheDocument();
    expect(screen.getByText(/Add title for it/)).toBeInTheDocument();
  });

  it('stays closed until the Delete button is pressed on a row', () => {
    render(<DeletePanelSection panel={panel({ open: false })} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('removes the task when the confirmation is pressed', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(<DeletePanelSection panel={panel({ onConfirm })} />);
    await user.click(screen.getByRole('button', { name: 'Delete task' }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('keeps the task when Cancel is pressed', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<DeletePanelSection panel={panel({ onCancel })} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('keeps the task when the dialog is dismissed', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(<DeletePanelSection panel={panel({ onOpenChange })} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
  });

  it('blocks a second confirmation and shows the API message when the delete was rejected', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <DeletePanelSection
        panel={panel({
          onConfirm,
          confirmDisabled: true,
          confirmLabel: 'Deleting…',
          errors: ['Task with id 42 was not found'],
        })}
      />,
    );

    expect(screen.getByText('Task with id 42 was not found')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Deleting…' }));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
