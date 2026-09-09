import type { ChangeEventHandler } from 'react';

export type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export interface FieldVm {
  value: string;
  onChange: ChangeEventHandler<FormControl>;
  /** Set once the field failed validation, so the reason sits next to the control. */
  error?: string | null;
}

export interface OptionVm {
  value: string;
  label: string;
}
