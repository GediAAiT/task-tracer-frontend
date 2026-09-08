import type { CacheBadgeVm } from '@/app/model/task/view/cache-badge.vm';

export function CacheBadgeSection({ badge }: { badge: CacheBadgeVm }) {
  if (!badge.visible) return null;

  return (
    <div className={`cache-badge ${badge.modifier}`}>
      <div className="cache-summary">
        <span className="cache-status">{badge.statusLabel}</span>
        <span className="cache-detail">{badge.detail}</span>
      </div>

      {badge.warning && <p className="cache-warning">{badge.warning}</p>}

      <div className="cache-footer">
        {badge.keyLabel && <code className="cache-key">{badge.keyLabel}</code>}
        <button
          type="button"
          className="cache-reload-btn"
          onClick={badge.onReload}
          disabled={badge.reloadDisabled}
        >
          {badge.reloadLabel}
        </button>
      </div>
    </div>
  );
}
