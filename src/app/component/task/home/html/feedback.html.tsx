import type { FeedbackVm } from '@/app/model/task/view/feedback.vm';

export function FeedbackSection({ feedback }: { feedback: FeedbackVm }) {
  if (!feedback.serverError) return null;

  return (
    <div className="error-banner" role="alert">
      <span>{feedback.serverError}</span>
      <button type="button" className="retry-btn" onClick={feedback.onRetry}>
        Try again
      </button>
    </div>
  );
}
