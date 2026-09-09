import type { TaskRowVm } from '@/app/model/task/view/task-row.vm';
import { DeletePanelSection } from './delete-panel.html';
import { DetailPanelSection } from './detail-panel.html';
import { EditPanelSection } from './edit-panel.html';
import { PersonIcon, RowIcon, StatusIcon } from './icons.html';

export function TaskRowSection({ row }: { row: TaskRowVm }) {
  return (
    <div className="task-card">
      <div
        className="card-header"
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        onClick={row.onOpen}
        onKeyDown={row.onKeyActivate}
      >
        <div className="header-content">
          <div className={`icon-container ${row.icon}`}>
            <RowIcon name={row.icon} />
          </div>

          <div className="main-info">
            <div className={row.isDone ? 'title-row is-done' : 'title-row'}>
              <h3 className="task-title">{row.title}</h3>
              <span className={`severity-badge ${row.severity}`}>{row.severityLabel}</span>
              {row.overdue && <span className="overdue-badge">Overdue</span>}
            </div>
            <p className="description">{row.description}</p>

            <div className="meta-row">
              <span className="author">
                <PersonIcon />
                {row.authorLabel}
              </span>
              <span className="dot">&bull;</span>
              <span className="time">{row.createdLabel}</span>
              <span className="dot">&bull;</span>
              <span className={`status-indicator ${row.statusModifier}`}>
                <StatusIcon name={row.statusIcon} />
                {row.statusLabel}
              </span>
            </div>

            {row.tags.length > 0 && (
              <div className="tag-row">
                {row.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <span className="open-hint">View details</span>
      </div>

      {row.detailPanel && <DetailPanelSection panel={row.detailPanel} />}
      {row.editPanel && <EditPanelSection panel={row.editPanel} />}
      {row.deletePanel && <DeletePanelSection panel={row.deletePanel} />}
    </div>
  );
}
