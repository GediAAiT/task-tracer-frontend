import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FeedbackVm } from '@/app/model/task/view/feedback.vm';
import { FeedbackSection } from '../feedback.html';

function feedback(overrides: Partial<FeedbackVm> = {}): FeedbackVm {
  return {
    serverError: 'The server is not available, please try again.',
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

  it('shows the error message while the backend is down', () => {
    render(<FeedbackSection feedback={feedback()} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'The server is not available, please try again.',
    );
  });

  it('keeps the silent reconnect out of the banner', () => {
    render(<FeedbackSection feedback={feedback()} />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).not.toHaveAttribute('aria-busy');
    expect(screen.getByRole('alert').textContent).not.toMatch(/reconnect|clears itself|checking/i);
  });

  it('shows nothing but the message for an error that is not an outage', () => {
    render(<FeedbackSection feedback={feedback({ serverError: 'Title is required.' })} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('disables the retry button while the list is already reloading', () => {
    render(<FeedbackSection feedback={feedback({ retryDisabled: true })} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
