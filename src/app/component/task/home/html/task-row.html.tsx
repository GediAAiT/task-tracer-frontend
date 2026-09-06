import type { TaskRowVm } from '@/app/model/task/view/task-row.vm';
import { ChevronDownIcon, PersonIcon, RowIcon, StatusIcon } from './icons.html';

export function TaskRowSection({ row }: { row: TaskRowVm }) {
  return (
    <div className={row.expanded ? 'task-accordion expanded' : 'task-accordion'}>
      <div
        className="accordion-header"
        role="button"
        tabIndex={0}
        aria-expanded={row.expanded}
        onClick={row.onToggle}
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

        <div className="expand-icon">
          <ChevronDownIcon />
        </div>
      </div>

      <div className={row.expanded ? 'accordion-body show' : 'accordion-body'}>
        <div className="body-content">
          <h4 className="details-heading">TASK DETAILS</h4>

          <div className="details-grid">
            {row.details.map((detail) => (
              <div key={detail.key} className="detail-box">
                <span className="detail-label">{detail.label}</span>
                <div className="value">{detail.value}</div>
              </div>
            ))}
          </div>

          {row.actions.length > 0 && (
            <div className="actions-container">
              {row.actions.map((action) => (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
