import type { CreatePanelVm } from '@/app/model/task/view/create-panel.vm';
import { TaskFormErrors, TaskFormFields } from './task-form.html';

export function CreatePanelSection({ panel }: { panel: CreatePanelVm }) {
  if (!panel.open) return null;

  return (
    <div className="create-panel">
      <h2 className="panel-heading">New task</h2>
      <form onSubmit={panel.onSubmit}>
        <TaskFormFields form={panel} />
        <TaskFormErrors errors={panel.errors} />

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
