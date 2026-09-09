import type { TaskFormPanelVm } from './task-form.vm';

export interface EditPanelVm extends TaskFormPanelVm {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
