# Qualidade

## Verificação automatizada

```bash
npm ci
npm run check
npm test
npm run build
npm run format:check
```

Os testes de integração executam em JSDOM. `showModal` e `close` são simulados nesse ambiente; o comportamento nativo de foco deve ser verificado em navegador real.

## Checklist manual

- Navegar com Tab e Shift+Tab sem perder a indicação de foco.
- Abrir e fechar modais com Escape e conferir retorno de foco.
- Abrir a navegação rápida com Ctrl+K/⌘K.
- Conferir layout em 1440 px, 768 px e 390 px e usar zoom de 200%.
- Alternar entre claro e escuro e conferir legibilidade.
- Recarregar após editar entidades para conferir persistência.
- Testar estado vazio e recuperação ao limpar filtros.
- Testar armazenamento desativado e observar aviso de sessão.

Não foram realizadas certificação WCAG, auditoria externa de segurança ou validação de capacidade em produção.
