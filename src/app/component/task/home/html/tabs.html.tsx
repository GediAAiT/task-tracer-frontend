import type { TabVm } from '@/app/model/task/view/tab.vm';

export function TabsSection({ tabs }: { tabs: TabVm[] }) {
  return (
    <div className="tabs-container">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={tab.active ? 'tab-btn active' : 'tab-btn'}
          onClick={tab.onSelect}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
