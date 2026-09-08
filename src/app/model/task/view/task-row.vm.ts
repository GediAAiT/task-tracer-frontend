import type { KeyboardEventHandler } from 'react';
import type { EditPanelVm } from './edit-panel.vm';

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

export interface TaskRowVm {
  id: string;
  title: string;
  description: string;
  icon: RowIconName;
  severity: string;
  severityLabel: string;
  statusModifier: string;
  statusLabel: string;
  statusIcon: StatusIconName;
  authorLabel: string;
  createdLabel: string;
  overdue: boolean;
  isDone: boolean;
  tags: string[];
  expanded: boolean;
  details: DetailVm[];
  actions: ActionVm[];
  /** Non-null while this row is in edit mode; the details grid is replaced by the form. */
  editPanel: EditPanelVm | null;
  onToggle: () => void;
  onKeyActivate: KeyboardEventHandler<HTMLDivElement>;
}
