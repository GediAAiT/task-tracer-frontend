import type { TaskFormVm } from '@/app/model/task/view/task-form.vm';

export function TaskFormFields({ form }: { form: TaskFormVm }) {
  return (
    <div className="form-grid">
      <label className="form-field full-width">
        <span className="field-label">Title</span>
        <input
          className="field-input"
          maxLength={200}
          required
          value={form.title.value}
          onChange={form.title.onChange}
        />
        <span className="field-hint">Required, up to 200 characters.</span>
      </label>

      <label className="form-field full-width">
        <span className="field-label">Description</span>
        <textarea
          className="field-textarea"
          rows={3}
          maxLength={2000}
          value={form.description.value}
          onChange={form.description.onChange}
        />
      </label>

      <label className="form-field">
        <span className="field-label">Status</span>
        <select
          className="field-select"
          value={form.status.value}
          onChange={form.status.onChange}
        >
          {form.statusOptions.map((option) => (
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
          value={form.priority.value}
          onChange={form.priority.onChange}
        >
          {form.priorityOptions.map((option) => (
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
          value={form.dueDate.value}
          onChange={form.dueDate.onChange}
        />
      </label>

      <label className="form-field">
        <span className="field-label">Assignee</span>
        <input
          className="field-input"
          maxLength={120}
          value={form.assignee.value}
          onChange={form.assignee.onChange}
        />
      </label>

      <label className="form-field full-width">
        <span className="field-label">Tags</span>
        <input
          className="field-input"
          placeholder="backend, urgent"
          value={form.tags.value}
          onChange={form.tags.onChange}
        />
        <span className="field-hint">Comma separated, up to 20 tags of 40 characters.</span>
      </label>
    </div>
  );
}

export function TaskFormErrors({ errors }: { errors: readonly string[] }) {
  if (errors.length === 0) return null;

  return (
    <ul className="form-errors">
      {errors.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}
