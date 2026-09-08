import type { EditPanelVm } from '@/app/model/task/view/edit-panel.vm';
import { TaskFormErrors, TaskFormFields } from './task-form.html';

export function EditPanelSection({ panel }: { panel: EditPanelVm }) {
  return (
    <form className="edit-form" onSubmit={panel.onSubmit}>
      <h4 className="details-heading">EDIT TASK</h4>

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
  );
}
