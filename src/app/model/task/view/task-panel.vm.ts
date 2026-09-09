import type { TaskFormPanelVm } from './task-form.vm';

export type RowIconName = 'user' | 'card' | 'settings' | 'dollar';

export type StatusIconName = 'check' | 'cross' | 'clock';

export interface DetailVm {
  key: string;
  label: string;
  value: string;
}

export interface ActionVm {
  key: string;
  label: string;
  modifier: string;
  disabled: boolean;
  onSelect: () => void;
}

export interface TaskPanelVm extends TaskFormPanelVm {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heading: string;
  icon: RowIconName;
  severity: string;
  severityLabel: string;
  statusModifier: string;
  statusLabel: string;
  statusIcon: StatusIconName;
  overdue: boolean;
  isDone: boolean;
  loading: boolean;
  details: DetailVm[];
  actions: ActionVm[];
}
