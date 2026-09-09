import type { KeyboardEventHandler } from 'react';
import type { DeletePanelVm } from './delete-panel.vm';
import type { DetailPanelVm, RowIconName, StatusIconName } from './detail-panel.vm';
import type { EditPanelVm } from './edit-panel.vm';

export type { ActionVm, DetailVm, RowIconName, StatusIconName } from './detail-panel.vm';

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
  detailPanel: DetailPanelVm | null;
  editPanel: EditPanelVm | null;
  deletePanel: DeletePanelVm | null;
  onOpen: () => void;
  onKeyActivate: KeyboardEventHandler<HTMLDivElement>;
}
