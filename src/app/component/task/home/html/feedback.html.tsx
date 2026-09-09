import type { FeedbackVm } from '@/app/model/task/view/feedback.vm';

export function FeedbackSection({ feedback }: { feedback: FeedbackVm }) {
  if (!feedback.serverError) return null;

  const waiting = feedback.status !== 'online';

  return (
    <div className="error-banner" role="alert" aria-busy={feedback.status === 'checking'}>
      <div className="error-banner-text">
        <span>{feedback.serverError}</span>

        {waiting && (
          <span className="reconnect-note" role="status">
            <span className="reconnect-spinner" aria-hidden="true" />
            Reconnecting automatically — this clears itself as soon as the server answers.
          </span>
        )}
      </div>

      <button
        type="button"
        className="retry-btn"
        onClick={feedback.onRetry}
        disabled={feedback.retryDisabled}
      >
        Try again
      </button>
    </div>
  );
}
