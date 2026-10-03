import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { it, expect } from 'vitest';
import App from './App';
it('creates, moves, deletes and restores a task', async () => {
  location.hash = 'board';
  render(<App />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Nova tarefa' }));
  await user.type(screen.getByLabelText('Título'), 'Implementar checkout');
  await user.click(screen.getByRole('button', { name: 'Salvar tarefa' }));
  expect(
    screen.getByRole('button', { name: 'Implementar checkout' }),
  ).toBeInTheDocument();
  await user.selectOptions(
    screen.getByLabelText('Mover Implementar checkout'),
    'Concluído',
  );
  expect(screen.getByLabelText('Mover Implementar checkout')).toHaveValue(
    'Concluído',
  );
  await user.click(screen.getByLabelText('Excluir Implementar checkout'));
  expect(
    screen.queryByRole('button', { name: 'Implementar checkout' }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Desfazer exclusão' }));
  expect(
    screen.getByRole('button', { name: 'Implementar checkout' }),
  ).toBeInTheDocument();
});
