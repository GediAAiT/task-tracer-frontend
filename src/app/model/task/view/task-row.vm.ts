import type { KeyboardEventHandler } from 'react';
import type { DeletePanelVm } from './delete-panel.vm';
import type { RowIconName, StatusIconName, TaskPanelVm } from './task-panel.vm';

export type { ActionVm, DetailVm, RowIconName, StatusIconName } from './task-panel.vm';

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
  taskPanel: TaskPanelVm | null;
  deletePanel: DeletePanelVm | null;
  onOpen: () => void;
  onKeyActivate: KeyboardEventHandler<HTMLElement>;
}
