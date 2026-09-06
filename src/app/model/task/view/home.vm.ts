import type { BannerVm } from './banner.vm';
import type { CreatePanelVm } from './create-panel.vm';
import type { FeedbackVm } from './feedback.vm';
import type { PaginationVm } from './pagination.vm';
import type { StatCardVm } from './stat-card.vm';
import type { TabVm } from './tab.vm';
import type { TaskListVm } from './task-list.vm';
import type { ToolbarVm } from './toolbar.vm';

export interface HomeVm {
  banner: BannerVm;
  subtitle: string;
  statCards: StatCardVm[];
  tabs: TabVm[];
  toolbar: ToolbarVm;
  createPanel: CreatePanelVm;
  feedback: FeedbackVm;
  list: TaskListVm;
  pagination: PaginationVm;
}
