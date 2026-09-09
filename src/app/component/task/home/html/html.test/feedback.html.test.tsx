import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FeedbackVm } from '@/app/model/task/view/feedback.vm';
import { FeedbackSection } from '../feedback.html';

function feedback(overrides: Partial<FeedbackVm> = {}): FeedbackVm {
  return {
    serverError: 'The server is not available, please try again.',
    status: 'offline',
    retryDisabled: false,
    onRetry: vi.fn(),
    ...overrides,
  };
}

describe('FeedbackSection', () => {
  it('says nothing while there is no error', () => {
    render(<FeedbackSection feedback={feedback({ serverError: null })} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('promises the banner will clear itself while the backend is down', () => {
    render(<FeedbackSection feedback={feedback()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The server is not available, please try again.',
    );
    expect(screen.getByRole('status')).toHaveTextContent(/clears itself/i);
  });

  it('marks the banner busy while a probe is in flight', () => {
    render(<FeedbackSection feedback={feedback({ status: 'checking' })} />);

    expect(screen.getByRole('alert')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('drops the waiting note for an error that is not an outage', () => {
    render(
      <FeedbackSection feedback={feedback({ serverError: 'Title is required.', status: 'online' })} />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('disables the retry button while the list is already reloading', () => {
    render(<FeedbackSection feedback={feedback({ retryDisabled: true })} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
