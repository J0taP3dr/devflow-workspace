import { z } from 'zod';
export const statuses = [
  'Backlog',
  'Em andamento',
  'Em revisão',
  'Concluído',
] as const;
export const priorities = ['Baixa', 'Média', 'Alta'] as const;
export const projects = ['Website', 'Design System', 'Aplicativo'] as const;
export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(3).max(100),
  description: z.string().max(2000),
  status: z.enum(statuses),
  priority: z.enum(priorities),
  project: z.enum(projects),
  owner: z.string().trim().min(1).max(40),
  due: z
    .string()
    .refine(
      (v) =>
        v === '' ||
        (/^\d{4}-\d{2}-\d{2}$/.test(v) &&
          !isNaN(Date.parse(v + 'T00:00:00Z')) &&
          new Date(v + 'T00:00:00Z').toISOString().slice(0, 10) === v),
      'Data inválida',
    ),
  points: z.number().int().min(1).max(13),
});
export const tasksSchema = z
  .array(taskSchema)
  .max(2000)
  .refine(
    (tasks) => new Set(tasks.map((t) => t.id)).size === tasks.length,
    'IDs de tarefas duplicados',
  );
export type Task = z.infer<typeof taskSchema>;
export const seed: Task[] = [
  {
    id: 'DF-101',
    title: 'Mapear a jornada de onboarding',
    description:
      'Documentar entrada, ativação e primeiro valor percebido pelo usuário.',
    status: 'Backlog',
    priority: 'Alta',
    project: 'Aplicativo',
    owner: 'Ana',
    due: '2026-10-16',
    points: 5,
  },
  {
    id: 'DF-102',
    title: 'Criar tokens de espaçamento',
    description: 'Definir escala de 4px e documentar usos por componente.',
    status: 'Backlog',
    priority: 'Média',
    project: 'Design System',
    owner: 'João',
    due: '2026-10-18',
    points: 3,
  },
  {
    id: 'DF-103',
    title: 'Auditar navegação por teclado',
    description: 'Verificar foco, landmarks e sequência de tabulação.',
    status: 'Backlog',
    priority: 'Alta',
    project: 'Website',
    owner: 'Rafa',
    due: '2026-10-12',
    points: 5,
  },
  {
    id: 'DF-104',
    title: 'Implementar busca no catálogo',
    description:
      'Busca por nome, categoria e estado vazio para resultados ausentes.',
    status: 'Em andamento',
    priority: 'Alta',
    project: 'Website',
    owner: 'João',
    due: '2026-10-10',
    points: 8,
  },
  {
    id: 'DF-105',
    title: 'Construir biblioteca de botões',
    description: 'Estados padrão, hover, foco, carregamento e desabilitado.',
    status: 'Em andamento',
    priority: 'Média',
    project: 'Design System',
    owner: 'Ana',
    due: '2026-10-14',
    points: 5,
  },
  {
    id: 'DF-106',
    title: 'Revisar fluxo de recuperação',
    description: 'Validar mensagens, feedback e opção de tentar novamente.',
    status: 'Em revisão',
    priority: 'Alta',
    project: 'Aplicativo',
    owner: 'Rafa',
    due: '2026-10-11',
    points: 3,
  },
  {
    id: 'DF-107',
    title: 'Validar contraste de cores',
    description: 'Conferir texto, bordas, ícones e componentes nos dois temas.',
    status: 'Em revisão',
    priority: 'Baixa',
    project: 'Design System',
    owner: 'Ana',
    due: '2026-10-20',
    points: 2,
  },
  {
    id: 'DF-108',
    title: 'Definir arquitetura de componentes',
    description: 'Separar componentes de UI, features e funções de domínio.',
    status: 'Concluído',
    priority: 'Alta',
    project: 'Website',
    owner: 'João',
    due: '2026-10-02',
    points: 8,
  },
  {
    id: 'DF-109',
    title: 'Configurar testes de integração',
    description: 'Executar fluxos principais no CI a cada pull request.',
    status: 'Concluído',
    priority: 'Média',
    project: 'Website',
    owner: 'Rafa',
    due: '2026-10-03',
    points: 5,
  },
];
export type TaskAction =
  | { type: 'save'; task: Task }
  | { type: 'move'; id: string; status: Task['status'] }
  | { type: 'delete'; id: string }
  | { type: 'restore'; task: Task };
export function taskReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'save': {
      const task = taskSchema.parse(action.task);
      return state.some((t) => t.id === task.id)
        ? state.map((t) => (t.id === task.id ? task : t))
        : [task, ...state];
    }
    case 'move':
      return state.map((t) =>
        t.id === action.id ? { ...t, status: action.status } : t,
      );
    case 'delete':
      return state.filter((t) => t.id !== action.id);
    case 'restore':
      return state.some((t) => t.id === action.task.id)
        ? state
        : [action.task, ...state];
  }
}
export function taskMetrics(tasks: Task[], today: string) {
  const done = tasks.filter((t) => t.status === 'Concluído');
  return {
    total: tasks.length,
    done: done.length,
    progress: tasks.length ? Math.round((done.length / tasks.length) * 100) : 0,
    points: tasks.reduce((s, t) => s + t.points, 0),
    completedPoints: done.reduce((s, t) => s + t.points, 0),
    overdue: tasks.filter(
      (t) => t.status !== 'Concluído' && t.due && t.due < today,
    ).length,
  };
}
export function importTasks(raw: string) {
  const data = JSON.parse(raw);
  return tasksSchema.parse(data);
}
