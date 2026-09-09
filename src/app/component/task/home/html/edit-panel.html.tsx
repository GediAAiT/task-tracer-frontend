import type { EditPanelVm } from '@/app/model/task/view/edit-panel.vm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskFormErrors, TaskFormFields } from './task-form.html';

const EDIT_FORM_ID = 'edit-task-form';

export function EditPanelSection({ panel }: { panel: EditPanelVm }) {
  return (
    <Dialog open={panel.open} onOpenChange={panel.onOpenChange}>
      <DialogContent className="edit-dialog">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            Update the details below. Title, status and priority are required.
          </DialogDescription>
        </DialogHeader>

        <form id={EDIT_FORM_ID} className="edit-dialog-body" onSubmit={panel.onSubmit}>
          <TaskFormFields form={panel} />
          <TaskFormErrors errors={panel.errors} />
        </form>

        <DialogFooter>
          <button
            type="submit"
            form={EDIT_FORM_ID}
            className="action-btn primary-btn"
            disabled={panel.submitDisabled}
          >
            {panel.submitLabel}
          </button>
          <button type="button" className="action-btn neutral-btn" onClick={panel.onCancel}>
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
