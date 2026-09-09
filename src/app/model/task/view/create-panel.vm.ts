import type { TaskFormPanelVm } from './task-form.vm';

export interface CreatePanelVm extends TaskFormPanelVm {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
