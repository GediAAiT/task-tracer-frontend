import type { FormEventHandler } from 'react';
import type { FieldVm, OptionVm } from './field.vm';

export interface CreatePanelVm {
  open: boolean;
  submitLabel: string;
  submitDisabled: boolean;
  errors: readonly string[];
  title: FieldVm;
  description: FieldVm;
  status: FieldVm;
  priority: FieldVm;
  dueDate: FieldVm;
  assignee: FieldVm;
  tags: FieldVm;
  statusOptions: OptionVm[];
  priorityOptions: OptionVm[];
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}
