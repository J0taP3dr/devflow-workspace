import { describe, it, expect } from 'vitest';
import { seed, taskReducer, taskMetrics, importTasks } from './model';
describe('task lifecycle', () => {
  it('moves a task without mutating the original', () => {
    const result = taskReducer(seed, {
      type: 'move',
      id: 'DF-101',
      status: 'Concluído',
    });
    expect(result[0].status).toBe('Concluído');
    expect(seed[0].status).toBe('Backlog');
  });
  it('deletes and restores without duplicating', () => {
    const removed = taskReducer(seed, { type: 'delete', id: seed[0].id });
    const restored = taskReducer(removed, { type: 'restore', task: seed[0] });
    expect(restored.length).toBe(seed.length);
    expect(
      taskReducer(restored, { type: 'restore', task: seed[0] }).length,
    ).toBe(seed.length);
  });
  it('updates an existing task', () => {
    const result = taskReducer(seed, {
      type: 'save',
      task: { ...seed[0], title: 'Título atualizado' },
    });
    expect(result.length).toBe(seed.length);
    expect(result[0].title).toBe('Título atualizado');
  });
  it('rejects malformed and duplicate imports', () => {
    expect(() => importTasks('{broken')).toThrow();
    expect(() => importTasks(JSON.stringify([seed[0], seed[0]]))).toThrow();
    expect(() =>
      importTasks(JSON.stringify([{ ...seed[0], points: -1 }])),
    ).toThrow();
  });
  it('computes progress and overdue tasks safely', () => {
    expect(taskMetrics([], '2026-10-01').progress).toBe(0);
    expect(taskMetrics(seed, '2027-01-01').overdue).toBe(7);
  });
});
