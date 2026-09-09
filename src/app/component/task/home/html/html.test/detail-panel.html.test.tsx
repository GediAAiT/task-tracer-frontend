import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DetailPanelVm } from '@/app/model/task/view/detail-panel.vm';
import { DetailPanelSection } from '../detail-panel.html';

function panel(overrides: Partial<DetailPanelVm> = {}): DetailPanelVm {
  return {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Renew the library cards',
    description: 'Every card issued before March needs a new expiry date.',
    icon: 'settings',
    severity: 'medium',
    severityLabel: 'Medium',
    statusModifier: 'todo',
    statusLabel: 'To do',
    statusIcon: 'clock',
    overdue: false,
    isDone: false,
    tags: ['backend'],
    loading: false,
    details: [
      { key: 'assignee', label: 'Assignee', value: 'Abebe' },
      { key: 'priority', label: 'Priority', value: 'Medium' },
    ],
    actions: [
      {
        key: 'IN_PROGRESS',
        label: 'Start task',
        modifier: 'primary-btn',
        disabled: false,
        onSelect: vi.fn(),
      },
    ],
    onCancel: vi.fn(),
    ...overrides,
  };
}

describe('DetailPanelSection', () => {
  it('shows the task in a dialog rather than an expanded row', () => {
    render(<DetailPanelSection panel={panel()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Renew the library cards' })).toBeInTheDocument();
    expect(screen.getByText('TASK DETAILS')).toBeInTheDocument();
    expect(screen.getByText('Abebe')).toBeInTheDocument();
    expect(screen.getByText('#backend')).toBeInTheDocument();
  });

  it('stays closed until a task is opened', () => {
    render(<DetailPanelSection panel={panel({ open: false })} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Renew the library cards')).not.toBeInTheDocument();
  });

  it('closes the dialog when Cancel is pressed', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(<DetailPanelSection panel={panel({ onCancel })} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('closes the dialog when it is dismissed', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();

    render(<DetailPanelSection panel={panel({ onOpenChange })} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false);
  });

  it('runs a task action from the dialog footer', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <DetailPanelSection
        panel={panel({
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
  });

  it('reports the overdue badge and the pending refresh', () => {
    render(<DetailPanelSection panel={panel({ overdue: true, loading: true })} />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing this task…');
  });
});
