import { useRef, useState } from 'react';
import {
  Columns3,
  List,
  ChartNoAxesCombined,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  Layers,
  Target,
} from 'lucide-react';
import { Shell, PageTitle, Empty, useRoute } from './components/Shell';
import { TaskEditor } from './features/tasks/TaskEditor';
import { TaskCard } from './features/tasks/TaskCard';
import {
  seed,
  tasksSchema,
  taskReducer,
  taskMetrics,
  statuses,
  priorities,
  projects,
  importTasks,
  type Task,
  type TaskAction,
} from './features/tasks/model';
import { useStored } from './lib/storage';
import { downloadFile, today, dateLabel } from './lib/format';
const nav = [
  { id: 'board', label: 'Quadro de tarefas', icon: <Columns3 size={18} /> },
  { id: 'list', label: 'Todas as tarefas', icon: <List size={18} /> },
  {
    id: 'insights',
    label: 'Indicadores',
    icon: <ChartNoAxesCombined size={18} />,
  },
];
export default function App() {
  const [route, navigate] = useRoute(nav);
  const [tasks, setTasks, warning] = useStored(
    'devflow:tasks:v1',
    tasksSchema,
    seed,
  );
  const [search, setSearch] = useState('');
  const [project, setProject] = useState('all');
  const [priority, setPriority] = useState('all');
  const [owner, setOwner] = useState('all');
  const [editing, setEditing] = useState<Task | null | undefined>(undefined);
  const [deleted, setDeleted] = useState<Task | null>(null);
  const [message, setMessage] = useState('');
  const [importError, setImportError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const dispatch = (action: TaskAction) =>
    setTasks((old) => taskReducer(old, action));
  const filtered = tasks.filter(
    (t) =>
      (project === 'all' || t.project === project) &&
      (priority === 'all' || t.priority === priority) &&
      (owner === 'all' || t.owner === owner) &&
      `${t.title} ${t.description}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );
  const metrics = taskMetrics(filtered, today());
  function move(task: Task, status: Task['status']) {
    dispatch({ type: 'move', id: task.id, status });
    setMessage(`${task.title}: movida para ${status}.`);
  }
  function remove(task: Task) {
    dispatch({ type: 'delete', id: task.id });
    setDeleted(task);
    setMessage('Tarefa excluída. Você pode desfazer abaixo.');
  }
  return (
    <Shell
      brand="DevFlow"
      tagline="Menos ruído. Mais entregas."
      items={nav}
      route={route}
      navigate={navigate}
    >
      <PageTitle
        eyebrow="PRODUCT WORKSPACE"
        title={
          route === 'insights'
            ? 'O ritmo do seu trabalho.'
            : 'Ideias em movimento.'
        }
        description="Organize prioridades, acompanhe entregas e dê espaço ao que importa."
        action={
          <button className="primary" onClick={() => setEditing(null)}>
            <Plus size={16} />
            Nova tarefa
          </button>
        }
      />
      {warning && (
        <p className="notice" role="alert">
          {warning}
        </p>
      )}
      <div role="status" className="status-message">
        {message}
      </div>
      {deleted && (
        <div className="notice undo">
          Tarefa removida: {deleted.title}
          <button
            onClick={() => {
              dispatch({ type: 'restore', task: deleted });
              setDeleted(null);
              setMessage('Tarefa restaurada.');
            }}
          >
            Desfazer exclusão
          </button>
        </div>
      )}
      <div className="metrics">
        {[
          {
            label: 'Tarefas no filtro',
            value: metrics.total,
            detail: `${metrics.points} pontos de esforço`,
            icon: <Layers size={17} />,
          },
          {
            label: 'Concluídas',
            value: metrics.done,
            detail: `${metrics.completedPoints} pontos entregues`,
            icon: <CheckCircle2 size={17} />,
          },
          {
            label: 'Progresso',
            value: `${metrics.progress}%`,
            detail: 'Proporção de tarefas concluídas',
            icon: <Target size={17} />,
          },
          {
            label: 'Prazo vencido',
            value: metrics.overdue,
            detail: 'Tarefas abertas anteriores a hoje',
            icon: <Clock size={17} />,
          },
        ].map((m) => (
          <article className="metric" key={m.label}>
            <div className="label">
              {m.label}
              {m.icon}
            </div>
            <strong>{m.value}</strong>
            <small>{m.detail}</small>
          </article>
        ))}
      </div>
      <div className="toolbar">
        <label className="field search-field">
          Buscar tarefa
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busque por título ou descrição..."
          />
        </label>
        <label className="field">
          Projeto
          <select value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="all">Todos os projetos</option>
            {projects.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Prioridade
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="all">Todas</option>
            {priorities.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Responsável
          <select value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="all">Todos</option>
            {[...new Set(tasks.map((t) => t.owner))].sort().map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            setSearch('');
            setProject('all');
            setPriority('all');
            setOwner('all');
          }}
        >
          Limpar
        </button>
      </div>
      {route === 'board' && (
        <>
          <div className="section-head">
            <h2>
              Quadro de trabalho{' '}
              <span className="count">{filtered.length}</span>
            </h2>
            <small>Arraste um cartão ou use o seletor de status.</small>
          </div>
          <div className="kanban">
            {statuses.map((status, i) => (
              <section
                key={status}
                className={'kanban-column column-' + i}
                aria-label={status}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const task = tasks.find(
                    (t) => t.id === e.dataTransfer.getData('text/plain'),
                  );
                  if (task) move(task, status);
                }}
              >
                <header>
                  <h3>
                    <span className="status-dot" />
                    {status}
                  </h3>
                  <span>
                    {filtered.filter((t) => t.status === status).length}
                  </span>
                </header>
                <div className="cards">
                  {filtered
                    .filter((t) => t.status === status)
                    .map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onEdit={() => setEditing(t)}
                        onDelete={() => remove(t)}
                        onMove={(s) => move(t, s)}
                      />
                    ))}
                  {!filtered.some((t) => t.status === status) && (
                    <div className="drop-placeholder">
                      Sem tarefas nesta etapa
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
      {route === 'list' && (
        <section className="panel">
          <div className="section-head">
            <h2>Lista de tarefas</h2>
            <span className="badge">{filtered.length} itens</span>
          </div>
          {filtered.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Tarefa</th>
                    <th>Projeto</th>
                    <th>Status</th>
                    <th>Prioridade</th>
                    <th>Responsável</th>
                    <th>Prazo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <button
                          className="text-button"
                          onClick={() => setEditing(t)}
                        >
                          {t.title}
                        </button>
                      </td>
                      <td>{t.project}</td>
                      <td>
                        <select
                          aria-label={`Mover ${t.title}`}
                          value={t.status}
                          onChange={(e) =>
                            move(t, e.target.value as Task['status'])
                          }
                        >
                          {statuses.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={'priority priority-' + t.priority}>
                          {t.priority}
                        </span>
                      </td>
                      <td>{t.owner}</td>
                      <td>{t.due ? dateLabel(t.due) : 'Sem prazo'}</td>
                      <td>
                        <button className="danger" onClick={() => remove(t)}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="Nenhuma tarefa encontrada"
              detail="Ajuste os filtros ou crie uma tarefa."
            />
          )}
        </section>
      )}
      {route === 'insights' && (
        <div className="insights-grid">
          <section className="panel">
            <div className="section-head">
              <h2>Distribuição por etapa</h2>
              <span className="badge">Filtro atual</span>
            </div>
            {statuses.map((s, i) => {
              const count = filtered.filter((t) => t.status === s).length;
              return (
                <div className={'insight-bar column-' + i} key={s}>
                  <div>
                    <span>{s}</span>
                    <strong>{count} tarefas</strong>
                  </div>
                  <progress
                    aria-label={s}
                    value={count}
                    max={Math.max(filtered.length, 1)}
                  />
                </div>
              );
            })}
          </section>
          <section className="panel">
            <h2>Entregas por projeto</h2>
            {projects.map((p) => {
              const m = taskMetrics(
                filtered.filter((t) => t.project === p),
                today(),
              );
              return (
                <div className="project-progress" key={p}>
                  <div>
                    <strong>{p}</strong>
                    <small>
                      {m.done} de {m.total} tarefas
                    </small>
                  </div>
                  <span>{m.progress}%</span>
                  <progress
                    aria-label={`Progresso de ${p}`}
                    value={m.progress}
                    max={100}
                  />
                </div>
              );
            })}
            <p className="insight-note">
              Os indicadores são calculados sobre as tarefas atuais. Não
              representam histórico de velocidade ou produtividade individual.
            </p>
          </section>
        </div>
      )}
      <section className="data-tools">
        <div>
          <strong>Seu workspace, com você.</strong>
          <p>
            Exporte um backup JSON ou importe tarefas sem substituir as
            existentes.
          </p>
        </div>
        <div className="row">
          <button
            onClick={() => {
              downloadFile(
                'devflow-backup.json',
                JSON.stringify(tasks, null, 2),
                'application/json',
              );
              setMessage('Backup exportado com todas as tarefas.');
            }}
          >
            <Download size={15} />
            Exportar
          </button>
          <button onClick={() => fileRef.current?.click()}>
            <Upload size={15} />
            Importar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            aria-label="Importar backup JSON"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              try {
                if (file.size > 2_000_000)
                  throw new Error('Arquivo maior que 2 MB.');
                const imported = importTasks(await file.text());
                const newTasks = imported.filter(
                  (t) => !tasks.some((old) => old.id === t.id),
                );
                const merged = tasksSchema.parse([...tasks, ...newTasks]);
                setTasks(merged);
                setImportError('');
                setMessage(
                  `${newTasks.length} tarefas importadas. IDs existentes foram preservados.`,
                );
              } catch {
                setImportError(
                  'Não foi possível importar: use JSON válido com até 2 MB, 2.000 tarefas e IDs únicos. Nenhum dado foi alterado.',
                );
              }
            }}
          />
        </div>
      </section>
      {importError && (
        <p role="alert" className="error">
          {importError}
        </p>
      )}
      {editing !== undefined && (
        <TaskEditor
          task={editing}
          onClose={() => setEditing(undefined)}
          onSave={(task) => {
            dispatch({ type: 'save', task });
            setEditing(undefined);
            setMessage('Tarefa salva.');
          }}
        />
      )}
    </Shell>
  );
}
