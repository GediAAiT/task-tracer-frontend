import type { CreatePanelVm } from '@/app/model/task/view/create-panel.vm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TaskFormErrors, TaskFormFields } from './task-form.html';

const CREATE_FORM_ID = 'create-task-form';

export function CreatePanelSection({ panel }: { panel: CreatePanelVm }) {
  return (
    <Dialog open={panel.open} onOpenChange={panel.onOpenChange}>
      <DialogTrigger className="new-task-btn">New task</DialogTrigger>

      <DialogContent className="create-dialog">
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
          <DialogDescription>
            Fill in the details below. Title, status and priority are required.
          </DialogDescription>
        </DialogHeader>

        <form id={CREATE_FORM_ID} className="create-dialog-body" onSubmit={panel.onSubmit}>
          <TaskFormFields form={panel} />
          <TaskFormErrors errors={panel.errors} />
        </form>

        <DialogFooter>
          <button
            type="submit"
            form={CREATE_FORM_ID}
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
