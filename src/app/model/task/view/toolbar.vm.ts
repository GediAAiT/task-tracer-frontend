import type { FieldVm } from './field.vm';

export interface ToolbarVm {
  search: FieldVm;
  newTaskLabel: string;
  onToggleCreate: () => void;
}
