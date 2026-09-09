import type { FieldVm } from '@/app/model/task/view/field.vm';
import type { TaskFormVm } from '@/app/model/task/view/task-form.vm';

function FieldNote({ field, hint }: { field: FieldVm; hint?: string }) {
  if (field.error) {
    return (
      <span className="field-error" role="alert">
        {field.error}
      </span>
    );
  }

  return hint ? <span className="field-hint">{hint}</span> : null;
}

export function TaskFormFields({ form }: { form: TaskFormVm }) {
  return (
    <div className="form-grid">
      <label className="form-field full-width">
        <span className="field-label">
          Title <span className="field-required">*</span>
        </span>
        <input
          className="field-input"
          maxLength={200}
          aria-invalid={Boolean(form.title.error)}
          value={form.title.value}
          onChange={form.title.onChange}
        />
        <FieldNote field={form.title} hint="Required, up to 200 characters." />
      </label>

      <label className="form-field full-width">
        <span className="field-label">Description</span>
        <textarea
          className="field-textarea"
          rows={3}
          maxLength={2000}
          aria-invalid={Boolean(form.description.error)}
          value={form.description.value}
          onChange={form.description.onChange}
        />
        <FieldNote field={form.description} />
      </label>

      <label className="form-field">
        <span className="field-label">
          Status <span className="field-required">*</span>
        </span>
        <select
          className="field-select"
          aria-invalid={Boolean(form.status.error)}
          value={form.status.value}
          onChange={form.status.onChange}
        >
          {form.status.value === '' && (
            <option value="" disabled>
              Select a status
            </option>
          )}
          {form.statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldNote field={form.status} hint="Required." />
      </label>

      <label className="form-field">
        <span className="field-label">
          Priority <span className="field-required">*</span>
        </span>
        <select
          className="field-select"
          aria-invalid={Boolean(form.priority.error)}
          value={form.priority.value}
          onChange={form.priority.onChange}
        >
          {form.priority.value === '' && (
            <option value="" disabled>
              Select a priority
            </option>
          )}
          {form.priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldNote field={form.priority} hint="Required." />
      </label>

      <label className="form-field">
        <span className="field-label">Due date</span>
        <input
          className="field-input"
          type="datetime-local"
          aria-invalid={Boolean(form.dueDate.error)}
          value={form.dueDate.value}
          onChange={form.dueDate.onChange}
        />
        <FieldNote field={form.dueDate} />
      </label>

      <label className="form-field">
        <span className="field-label">Assignee</span>
        <input
          className="field-input"
          maxLength={120}
          aria-invalid={Boolean(form.assignee.error)}
          value={form.assignee.value}
          onChange={form.assignee.onChange}
        />
        <FieldNote field={form.assignee} />
      </label>

      <label className="form-field full-width">
        <span className="field-label">Tags</span>
        <input
          className="field-input"
          placeholder="backend, urgent"
          aria-invalid={Boolean(form.tags.error)}
          value={form.tags.value}
          onChange={form.tags.onChange}
        />
        <FieldNote field={form.tags} hint="Comma separated, up to 20 tags of 40 characters." />
      </label>
    </div>
  );
}

export function TaskFormErrors({ errors }: { errors: readonly string[] }) {
  if (errors.length === 0) return null;

  return (
    <ul className="form-errors" role="alert">
      {errors.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}
