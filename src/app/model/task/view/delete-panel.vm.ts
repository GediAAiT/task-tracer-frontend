export interface DeletePanelVm {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  confirmLabel: string;
  confirmDisabled: boolean;
  errors: readonly string[];
  onConfirm: () => void;
  onCancel: () => void;
}
