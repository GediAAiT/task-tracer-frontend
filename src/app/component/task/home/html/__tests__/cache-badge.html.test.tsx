import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CacheBadgeVm } from '@/app/model/task/view/cache-badge.vm';
import { CacheBadgeSection } from '../cache-badge.html';

function badge(overrides: Partial<CacheBadgeVm> = {}): CacheBadgeVm {
  return {
    visible: true,
    statusLabel: 'Redis hit',
    modifier: 'hit',
    detail: 'Replayed from Redis — this snapshot was computed 45s ago.',
    keyLabel: 'tasks:page=1:limit=20',
    warning: null,
    reloadLabel: 'Reload list',
    reloadDisabled: false,
    onReload: vi.fn(),
    ...overrides,
  };
}

describe('CacheBadgeSection', () => {
  it('renders nothing when the API reported no cache status', () => {
    const { container } = render(<CacheBadgeSection badge={badge({ visible: false })} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the status, detail and Redis key', () => {
    render(<CacheBadgeSection badge={badge()} />);

    expect(screen.getByText('Redis hit')).toBeInTheDocument();
    expect(
      screen.getByText('Replayed from Redis — this snapshot was computed 45s ago.'),
    ).toBeInTheDocument();
    expect(screen.getByText('tasks:page=1:limit=20')).toBeInTheDocument();
  });

  it('omits the key and the warning when neither was reported', () => {
    render(<CacheBadgeSection badge={badge({ keyLabel: null, warning: null })} />);

    expect(screen.queryByText('tasks:page=1:limit=20')).not.toBeInTheDocument();
    expect(document.querySelector('.cache-warning')).toBeNull();
  });

  it('surfaces the stale-rows warning when invalidation is switched off', () => {
    const warning =
      'Invalidation is switched off on the API: these rows are a cached snapshot.';

    render(<CacheBadgeSection badge={badge({ warning })} />);

    expect(screen.getByText(warning)).toBeInTheDocument();
  });

  it('reloads the list when the reload button is pressed', async () => {
    const onReload = vi.fn();
    const user = userEvent.setup();

    render(<CacheBadgeSection badge={badge({ onReload })} />);
    await user.click(screen.getByRole('button', { name: 'Reload list' }));

    expect(onReload).toHaveBeenCalledOnce();
  });

  it('disables the reload button while a reload is in flight', async () => {
    const onReload = vi.fn();
    const user = userEvent.setup();

    render(
      <CacheBadgeSection
        badge={badge({ onReload, reloadLabel: 'Reloading…', reloadDisabled: true })}
      />,
    );

    const button = screen.getByRole('button', { name: 'Reloading…' });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onReload).not.toHaveBeenCalled();
  });
});
