import type { FormEventHandler } from 'react';
import type { FieldVm, OptionVm } from './field.vm';

/** The seven editable task fields, shared by the create panel and the row editor. */
export interface TaskFormVm {
  title: FieldVm;
  description: FieldVm;
  status: FieldVm;
  priority: FieldVm;
  dueDate: FieldVm;
  assignee: FieldVm;
  tags: FieldVm;
  statusOptions: OptionVm[];
  priorityOptions: OptionVm[];
}

export interface TaskFormPanelVm extends TaskFormVm {
  submitLabel: string;
  submitDisabled: boolean;
  errors: readonly string[];
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
}
