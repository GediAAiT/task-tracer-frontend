export interface FeedbackVm {
  serverError: string | null;
  onRetry: () => void;
}
