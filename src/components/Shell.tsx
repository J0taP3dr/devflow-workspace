import { useEffect, useState, type ReactNode } from 'react';
import { z } from 'zod';
import { ArrowUpRight, Command, Moon, Sun, Search } from 'lucide-react';
import { useStored } from '../lib/storage';
import { Modal } from './Modal';
const themeSchema = z.enum(['light', 'dark']);
export type NavItem = { id: string; label: string; icon: ReactNode };
export function useRoute(items: NavItem[]) {
  const read = () =>
    items.some((i) => i.id === location.hash.slice(1))
      ? location.hash.slice(1)
      : items[0].id;
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const change = () => setRoute(read());
    addEventListener('hashchange', change);
    return () => removeEventListener('hashchange', change);
  }, []);
  return [
    route,
    (id: string) => {
      location.hash = id;
      setRoute(id);
    },
  ] as const;
}
export function Shell({
  brand,
  tagline,
  items,
  route,
  navigate,
  children,
}: {
  brand: string;
  tagline: string;
  items: NavItem[];
  route: string;
  navigate: (id: string) => void;
  children: ReactNode;
}) {
  const [theme, setTheme] = useStored(
    'frontend-theme:v1',
    themeSchema,
    'light',
  );
  const [command, setCommand] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommand((old) => !old);
      }
    };
    addEventListener('keydown', handler);
    return () => removeEventListener('keydown', handler);
  }, []);
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        Pular para conteúdo
      </a>
      <aside className="sidebar">
        <a className="brand" href={'#' + items[0].id}>
          <span className="brand-mark">{brand[0]}</span>
          {brand}
          <span className="brand-dot">®</span>
        </a>
        <p className="workspace-label">WORKSPACE / DEMO</p>
        <nav aria-label="Navegação principal">
          {items.map((item) => (
            <a
              key={item.id}
              href={'#' + item.id}
              aria-current={route === item.id ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="eyebrow">FEITO PARA EXPLORAR</span>
          <h3>{tagline}</h3>
          <p>Experimente todos os recursos com dados demonstrativos.</p>
          <ArrowUpRight size={25} />
        </div>
        <div className="profile">
          <span className="avatar">JP</span>
          <div>
            <strong>Portfólio Front-End</strong>
            <small>Ambiente demonstrativo</small>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="breadcrumb">
            Workspace <span>/</span> {items.find((i) => i.id === route)?.label}
          </span>
          <div className="row">
            <button className="command-button" onClick={() => setCommand(true)}>
              <Search size={16} />
              <span>Ir para...</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="icon-button"
              aria-label={
                theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'
              }
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <span className="avatar small">JP</span>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="app-footer">
          <span>{brand} — Front-End Portfolio</span>
          <span>Dados demonstrativos · Armazenamento local</span>
        </footer>
      </div>
      {command && (
        <Modal title="Navegação rápida" onClose={() => setCommand(false)}>
          <label className="field">
            Pesquisar página
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o nome de uma página"
            />
          </label>
          <div className="command-results">
            {items
              .filter((i) =>
                i.label.toLowerCase().includes(query.toLowerCase()),
              )
              .map((i) => (
                <button
                  key={i.id}
                  onClick={() => {
                    navigate(i.id);
                    setCommand(false);
                    setQuery('');
                  }}
                >
                  {i.icon}
                  {i.label}
                  <Command size={14} />
                </button>
              ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="empty">
      <Search size={30} />
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
  );
}
