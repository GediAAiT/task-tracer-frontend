import type { BackendStatus } from '@/app/model/health/health';

export interface FeedbackVm {
  serverError: string | null;
  status: BackendStatus;
  retryDisabled: boolean;
  onRetry: () => void;
}
