import type { ChangeEventHandler } from 'react';

export type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export interface FieldVm {
  value: string;
  onChange: ChangeEventHandler<FormControl>;
  error?: string | null;
}

export interface OptionVm {
  value: string;
  label: string;
}
