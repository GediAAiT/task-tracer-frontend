import type { CreatePanelVm } from '@/app/model/task/view/create-panel.vm';

export function CreatePanelSection({ panel }: { panel: CreatePanelVm }) {
  if (!panel.open) return null;

  return (
    <div className="create-panel">
      <h2 className="panel-heading">New task</h2>
      <form onSubmit={panel.onSubmit}>
        <div className="form-grid">
          <label className="form-field full-width">
            <span className="field-label">Title</span>
            <input
              className="field-input"
              maxLength={200}
              required
              value={panel.title.value}
              onChange={panel.title.onChange}
            />
            <span className="field-hint">Required, up to 200 characters.</span>
          </label>

          <label className="form-field full-width">
            <span className="field-label">Description</span>
            <textarea
              className="field-textarea"
              rows={3}
              maxLength={2000}
              value={panel.description.value}
              onChange={panel.description.onChange}
            />
          </label>

          <label className="form-field">
            <span className="field-label">Status</span>
            <select
              className="field-select"
              value={panel.status.value}
              onChange={panel.status.onChange}
            >
              {panel.statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="field-label">Priority</span>
            <select
              className="field-select"
              value={panel.priority.value}
              onChange={panel.priority.onChange}
            >
              {panel.priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span className="field-label">Due date</span>
            <input
              className="field-input"
              type="datetime-local"
              value={panel.dueDate.value}
              onChange={panel.dueDate.onChange}
            />
          </label>

          <label className="form-field">
            <span className="field-label">Assignee</span>
            <input
              className="field-input"
              maxLength={120}
              value={panel.assignee.value}
              onChange={panel.assignee.onChange}
            />
          </label>

          <label className="form-field full-width">
            <span className="field-label">Tags</span>
            <input
              className="field-input"
              placeholder="backend, urgent"
              value={panel.tags.value}
              onChange={panel.tags.onChange}
            />
            <span className="field-hint">Comma separated, up to 20 tags of 40 characters.</span>
          </label>
        </div>

        {panel.errors.length > 0 && (
          <ul className="form-errors">
            {panel.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className="form-actions">
          <button type="submit" className="action-btn primary-btn" disabled={panel.submitDisabled}>
            {panel.submitLabel}
          </button>
          <button type="button" className="action-btn neutral-btn" onClick={panel.onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
