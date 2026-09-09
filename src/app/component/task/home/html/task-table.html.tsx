import type { TaskRowVm } from '@/app/model/task/view/task-row.vm';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PersonIcon, StatusIcon } from './icons.html';
import { TaskPanelsSection } from './task-panels.html';

export function TaskTableSection({
  rows,
  caption,
}: {
  rows: TaskRowVm[];
  caption: string;
}) {
  return (
    <div className="tasks-table">
      <Table>
        <TableCaption>{caption}</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className="task-column">Task</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead className="created-column">Created</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="clickable" onClick={row.onOpen}>
              <TableCell className="task-cell">
                <div className="task-brief">
                  <span className="task-headline">
                    <button
                      type="button"
                      className={row.isDone ? 'task-link is-done' : 'task-link'}
                      aria-haspopup="dialog"
                      onClick={(event) => {
                        event.stopPropagation();
                        row.onOpen();
                      }}
                    >
                      {row.title}
                    </button>
                    {row.overdue && <span className="overdue-badge">Overdue</span>}
                  </span>
                  <span className="task-summary">{row.description}</span>
                </div>
              </TableCell>

              <TableCell>
                <span className={`severity-badge ${row.severity}`}>{row.severityLabel}</span>
              </TableCell>

              <TableCell>
                <span className={`status-indicator ${row.statusModifier}`}>
                  <StatusIcon name={row.statusIcon} />
                  {row.statusLabel}
                </span>
              </TableCell>

              <TableCell>
                <span className="assignee">
                  <PersonIcon />
                  {row.authorLabel}
                </span>
              </TableCell>

              <TableCell className="created-column">{row.createdLabel}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {rows.map((row) => (
        <TaskPanelsSection key={row.id} row={row} />
      ))}
    </div>
  );
}
