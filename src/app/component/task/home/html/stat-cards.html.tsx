import type { StatCardVm } from '@/app/model/task/view/stat-card.vm';

export function StatCardsSection({ cards }: { cards: StatCardVm[] }) {
  return (
    <div className="stats-cards">
      {cards.map((card) => (
        <div key={card.key} className={`stat-card ${card.modifier}`}>
          <div className="stat-label">{card.label}</div>
          <div className="stat-value">{card.value}</div>
        </div>
      ))}
    </div>
  );
}
