import type { FeedbackVm } from '@/app/model/task/view/feedback.vm';

export function FeedbackSection({ feedback }: { feedback: FeedbackVm }) {
  if (!feedback.serverError) return null;

  return (
    <div className="error-banner" role="alert">
      <div className="error-banner-text">
        <span>{feedback.serverError}</span>
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
