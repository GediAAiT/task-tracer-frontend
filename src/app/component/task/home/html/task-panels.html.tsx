import type { TaskRowVm } from '@/app/model/task/view/task-row.vm';
import { DeletePanelSection } from './delete-panel.html';
import { TaskPanelSection } from './task-panel.html';

export function TaskPanelsSection({ row }: { row: TaskRowVm }) {
  return (
    <>
      {row.taskPanel && <TaskPanelSection panel={row.taskPanel} />}
      {row.deletePanel && <DeletePanelSection panel={row.deletePanel} />}
    </>
  );
}
