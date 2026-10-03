import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { taskSchema, statuses, priorities, projects, type Task } from './model';
export function TaskEditor({
  task,
  onSave,
  onClose,
}: {
  task: Task | null;
  onSave: (task: Task) => void;
  onClose: () => void;
}) {
  const [error, setError] = useState('');
  return (
    <Modal
      title={task ? 'Editar tarefa' : 'Criar uma nova tarefa'}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const values = Object.fromEntries(new FormData(e.currentTarget));
          const result = taskSchema.safeParse({
            ...values,
            id: task?.id ?? crypto.randomUUID(),
            points: Number(values.points),
          });
          if (!result.success) {
            setError(result.error.issues[0].message);
            return;
          }
          onSave(result.data);
        }}
      >
        <label className="field">
          Título
          <input
            autoFocus
            name="title"
            required
            minLength={3}
            maxLength={100}
            defaultValue={task?.title}
            placeholder="O que precisa ser feito?"
          />
        </label>
        <label className="field">
          Descrição
          <textarea
            name="description"
            maxLength={2000}
            defaultValue={task?.description}
            placeholder="Contexto, critérios de aceite e detalhes..."
          />
        </label>
        <div className="form-row">
          <label className="field">
            Projeto
            <select name="project" defaultValue={task?.project ?? 'Website'}>
              {projects.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Status
            <select name="status" defaultValue={task?.status ?? 'Backlog'}>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label className="field">
            Prioridade
            <select name="priority" defaultValue={task?.priority ?? 'Média'}>
              {priorities.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Responsável
            <input
              name="owner"
              required
              maxLength={40}
              defaultValue={task?.owner ?? 'João'}
            />
          </label>
        </div>
        <div className="form-row">
          <label className="field">
            Prazo
            <input name="due" type="date" defaultValue={task?.due} />
          </label>
          <label className="field">
            Pontos de esforço
            <input
              name="points"
              type="number"
              min="1"
              max="13"
              required
              defaultValue={task?.points ?? 3}
            />
          </label>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary">Salvar tarefa</button>
        </div>
      </form>
    </Modal>
  );
}
