import type { HomeVm } from '@/app/model/task/view/home.vm';
import { BannerSection } from './html/banner.html';
import { CacheBadgeSection } from './html/cache-badge.html';
import { CreatePanelSection } from './html/create-panel.html';
import { FeedbackSection } from './html/feedback.html';
import { PaginationSection } from './html/pagination.html';
import { StatCardsSection } from './html/stat-cards.html';
import { TabsSection } from './html/tabs.html';
import { TaskListSection } from './html/task-list.html';
import { ToolbarSection } from './html/toolbar.html';

export function HomeTemplate(props: HomeVm) {
  return (
    <div className="tasks-container">
      <BannerSection banner={props.banner} />

      <div className="header-section">
        <p className="subtitle">{props.subtitle}</p>
      </div>

      <StatCardsSection cards={props.statCards} />
      <TabsSection tabs={props.tabs} />
      <ToolbarSection toolbar={props.toolbar} />
      <CacheBadgeSection badge={props.cacheBadge} />
      <CreatePanelSection panel={props.createPanel} />
      <FeedbackSection feedback={props.feedback} />
      <TaskListSection list={props.list} />
      <PaginationSection pagination={props.pagination} />
    </div>
  );
}
