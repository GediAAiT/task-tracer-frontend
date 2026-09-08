export interface CacheBadgeVm {
  visible: boolean;
  statusLabel: string;
  modifier: string;
  detail: string;
  keyLabel: string | null;
  warning: string | null;
  reloadLabel: string;
  reloadDisabled: boolean;
  onReload: () => void;
}
