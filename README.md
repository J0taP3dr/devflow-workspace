# DevFlow

> Menos ruído. Mais entregas.

Um workspace de projetos com Kanban acessível, gerenciamento de tarefas e indicadores derivados do estado atual.

**React · TypeScript · Vite · Zod · Vitest · Testing Library**

## Funcionalidades

- Criação, edição, exclusão e restauração da última tarefa removida.
- Kanban com arrastar e soltar no desktop e seletor acessível por teclado ou toque.
- Visualização em lista e filtros combinados por projeto, prioridade, responsável e texto.
- Indicadores de conclusão, pontos de esforço e prazos vencidos.
- Backup JSON e importação validada com proteção contra IDs duplicados.
- Layout responsivo, tema claro/escuro e suporte a movimento reduzido.
- Navegação por hash e paleta de navegação com `Ctrl+K` ou `⌘K`.
- Estados vazios, mensagens de resultado e recuperação de erros de armazenamento.

## Rodar localmente

Requer **Node.js 24** e npm.

```bash
git clone https://github.com/J0taP3dr/devflow-workspace.git
cd devflow-workspace
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`.
Não são necessárias chaves de API ou variáveis de ambiente.

## Comandos

| Comando                | Finalidade                                    |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento                   |
| `npm run check`        | Verificação TypeScript estrita                |
| `npm test`             | Testes de domínio e integração de componentes |
| `npm run build`        | Typecheck e build de produção em `dist/`      |
| `npm run preview`      | Inspecionar o build localmente                |
| `npm run format`       | Formatar com Prettier                         |
| `npm run format:check` | Verificar formatação                          |

## Experimente este fluxo

Crie uma tarefa, mova-a para Em andamento usando o seletor ou arraste. Edite o título, exclua e desfaça. Explore Indicadores e exporte um backup.

## Organização

```text
src/
  components/    # Shell, modal nativo e boundary de erros
  features/      # Componentes e regras do domínio
  lib/           # Persistência, formatação e utilitários
  test/          # Setup de testes DOM
  App.tsx        # Composição de páginas e estado da aplicação
  main.tsx       # Entrada React
  styles.css     # Tokens e componentes visuais compartilhados
  project.css    # Identidade e componentes específicos
```

## Regras de domínio

A importação adiciona somente IDs novos e preserva tarefas existentes. Arquivos acima de 2 MB, esquemas inválidos e IDs duplicados são rejeitados integralmente. O total permitido na importação é de 2.000 tarefas. Indicadores representam o estado atual, não histórico de velocidade. O armazenamento local usa last-write-wins entre abas e não substitui um backend colaborativo.

## Persistência e limitações

Este é um projeto **Front-End demonstrativo**. Os dados editáveis ficam no `localStorage` deste navegador, sob chaves versionadas, com validação Zod. Limpar os dados do navegador remove as alterações. Se o armazenamento estiver indisponível, a interface avisa que os dados ficam apenas em memória. Atualizações entre abas adotam a última gravação.

Não há autenticação, autorização, banco de dados remoto ou colaboração em tempo real. Não use dados sensíveis. Uma versão de produção precisaria de API, validação no servidor e políticas de acesso.

## Qualidade e acessibilidade

O workflow `.github/workflows/ci.yml` instala o lockfile, verifica tipos, executa testes e gera o build. Os testes cobrem regras de negócio e fluxos completos com Testing Library; o modal usa `dialog` nativo, retorno de foco e Escape. As páginas usam landmarks, labels, foco visível e link para pular ao conteúdo. Isso não constitui certificação WCAG; veja [o checklist](docs/QUALITY.md).

## Publicação estática

`npm run build` gera arquivos estáticos em `dist/`. A configuração `base: './'` e a navegação por hash permitem hospedagem em subdiretórios. Publique **o conteúdo de `dist/`** em uma hospedagem estática. Este repositório contém código-fonte; a criação do repositório não ativa automaticamente GitHub Pages.

## Decisões técnicas

Veja [ARCHITECTURE.md](docs/ARCHITECTURE.md) para decisões, contratos e evolução sugerida.

Referências: [React](https://react.dev/reference/react), [Vite](https://vite.dev/guide/static-deploy.html), [Zod](https://zod.dev/).
