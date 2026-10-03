import { CalendarDays, Trash2, GripVertical } from 'lucide-react';
import { today, dateLabel } from '../../lib/format';
import { statuses, type Task } from './model';
export function TaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (s: Task['status']) => void;
}) {
  const overdue = task.due && task.due < today() && task.status !== 'Concluído';
  return (
    <article
      className="task-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <div className="task-top">
        <span className={'priority priority-' + task.priority}>
          {task.priority}
        </span>
        <span className="task-points">
          {task.points} pts <GripVertical size={14} />
        </span>
      </div>
      <button className="task-title" onClick={onEdit}>
        {task.title}
      </button>
      <p>{task.description}</p>
      <span className="project-tag">{task.project}</span>
      <div className="task-meta">
        <span className={'task-date ' + (overdue ? 'overdue' : '')}>
          <CalendarDays size={12} />
          {task.due ? dateLabel(task.due) : 'Sem prazo'}
        </span>
        <span
          className="avatar"
          title={task.owner}
          aria-label={`Responsável: ${task.owner}`}
        >
          {task.owner.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="task-controls">
        <select
          aria-label={`Mover ${task.title}`}
          value={task.status}
          onChange={(e) => onMove(e.target.value as Task['status'])}
        >
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <button
          className="icon-button danger"
          aria-label={`Excluir ${task.title}`}
          onClick={onDelete}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}
