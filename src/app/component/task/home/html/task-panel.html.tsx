import type { TaskPanelVm } from '@/app/model/task/view/task-panel.vm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RowIcon, StatusIcon } from './icons.html';
import { TaskFormErrors, TaskFormFields } from './task-form.html';

const TASK_FORM_ID = 'task-panel-form';

export function TaskPanelSection({ panel }: { panel: TaskPanelVm }) {
  return (
    <Dialog open={panel.open} onOpenChange={panel.onOpenChange}>
      <DialogContent className="task-dialog">
        <DialogHeader>
          <div className="task-heading">
            <div className={`icon-container ${panel.icon}`}>
              <RowIcon name={panel.icon} />
            </div>

            <div className="task-headline">
              <DialogTitle className={panel.isDone ? 'is-done' : undefined}>
                {panel.heading}
              </DialogTitle>

              <div className="task-badges">
                <span className={`severity-badge ${panel.severity}`}>{panel.severityLabel}</span>
                <span className={`status-indicator ${panel.statusModifier}`}>
                  <StatusIcon name={panel.statusIcon} />
                  {panel.statusLabel}
                </span>
                {panel.overdue && <span className="overdue-badge">Overdue</span>}
              </div>
            </div>
          </div>

          <DialogDescription>
            Change any field and save, or pick one of the actions below.
          </DialogDescription>
        </DialogHeader>

        <div className="task-dialog-body">
          <form id={TASK_FORM_ID} onSubmit={panel.onSubmit}>
            <TaskFormFields form={panel} />
            <TaskFormErrors errors={panel.errors} />
          </form>

          {panel.details.length > 0 && (
            <>
              <h4 className="details-heading">TASK HISTORY</h4>

              <div className="details-grid">
                {panel.details.map((detail) => (
                  <div key={detail.key} className="detail-box">
                    <span className="detail-label">{detail.label}</span>
                    <div className="value">{detail.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {panel.loading && (
            <p className="detail-loading" role="status">
              Refreshing this task…
            </p>
          )}
        </div>

        <DialogFooter>
          <button
            type="submit"
            form={TASK_FORM_ID}
            className="action-btn primary-btn"
            disabled={panel.submitDisabled}
          >
            {panel.submitLabel}
          </button>

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
