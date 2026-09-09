export interface FeedbackVm {
  serverError: string | null;
  retryDisabled: boolean;
  onRetry: () => void;
}
