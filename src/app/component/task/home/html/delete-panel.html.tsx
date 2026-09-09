import type { DeletePanelVm } from '@/app/model/task/view/delete-panel.vm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function DeletePanelSection({ panel }: { panel: DeletePanelVm }) {
  return (
    <Dialog open={panel.open} onOpenChange={panel.onOpenChange}>
      <DialogContent className="delete-dialog">
        <DialogHeader>
          <DialogTitle>Delete task</DialogTitle>
          <DialogDescription>
            &ldquo;{panel.taskTitle}&rdquo; will be removed for good. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {panel.errors.length > 0 && (
          <ul className="form-errors">
            {panel.errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <button
            type="button"
            className="action-btn danger-btn"
            disabled={panel.confirmDisabled}
            onClick={panel.onConfirm}
          >
            {panel.confirmLabel}
          </button>
          <button type="button" className="action-btn neutral-btn" onClick={panel.onCancel}>
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
