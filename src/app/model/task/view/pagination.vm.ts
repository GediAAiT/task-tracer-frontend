export interface PaginationVm {
  visible: boolean;
  info: string;
  position: string;
  previousDisabled: boolean;
  nextDisabled: boolean;
  onPrevious: () => void;
  onNext: () => void;
}
