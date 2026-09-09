import type { DetailPanelVm } from '@/app/model/task/view/detail-panel.vm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RowIcon, StatusIcon } from './icons.html';

export function DetailPanelSection({ panel }: { panel: DetailPanelVm }) {
  return (
    <Dialog open={panel.open} onOpenChange={panel.onOpenChange}>
      <DialogContent className="detail-dialog">
        <DialogHeader>
          <div className="detail-heading">
            <div className={`icon-container ${panel.icon}`}>
              <RowIcon name={panel.icon} />
            </div>

            <div className="detail-headline">
              <DialogTitle className={panel.isDone ? 'is-done' : undefined}>
                {panel.title}
              </DialogTitle>

              <div className="detail-badges">
                <span className={`severity-badge ${panel.severity}`}>{panel.severityLabel}</span>
                <span className={`status-indicator ${panel.statusModifier}`}>
                  <StatusIcon name={panel.statusIcon} />
                  {panel.statusLabel}
                </span>
                {panel.overdue && <span className="overdue-badge">Overdue</span>}
              </div>
            </div>
          </div>

          <DialogDescription>{panel.description}</DialogDescription>
        </DialogHeader>

        <div className="detail-dialog-body">
          {panel.tags.length > 0 && (
            <div className="tag-row">
              {panel.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <h4 className="details-heading">TASK DETAILS</h4>

          <div className="details-grid">
            {panel.details.map((detail) => (
              <div key={detail.key} className="detail-box">
                <span className="detail-label">{detail.label}</span>
                <div className="value">{detail.value}</div>
              </div>
            ))}
          </div>

          {panel.loading && (
            <p className="detail-loading" role="status">
              Refreshing this task…
            </p>
          )}
        </div>

        <DialogFooter>
          {panel.actions.map((action) => (
            <button
              key={action.key}
              type="button"
              className={`action-btn ${action.modifier}`}
              disabled={action.disabled}
              onClick={action.onSelect}
            >
              {action.label}
            </button>
          ))}

          <button type="button" className="action-btn neutral-btn" onClick={panel.onCancel}>
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
