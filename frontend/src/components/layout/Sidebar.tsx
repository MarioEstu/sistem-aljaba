import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  Package,
  Image as ImageIcon,
  Folder,
  BookOpen,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { usePdfJobs } from '@/hooks/usePdfJobs'
import { useTheme } from '@/context/ThemeContext'

// ─── Types ──────────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: boolean
}

// ─── Nav definitions ────────────────────────────────────────────────────────────

const WORK_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Inicio',       icon: <LayoutGrid size={16} />, path: '/dashboard' },
  { id: 'products',   label: 'Productos',    icon: <Package size={16} />,    path: '/products' },
  { id: 'images',     label: 'Imágenes',     icon: <ImageIcon size={16} />,  path: '/images' },
  { id: 'categories', label: 'Categorías',   icon: <Folder size={16} />,     path: '/categories' },
  { id: 'catalogs',   label: 'Catálogos',    icon: <BookOpen size={16} />,   path: '/catalogs' },
  { id: 'pdfs',       label: 'Trabajos PDF', icon: <FileText size={16} />,   path: '/pdf-jobs' },
]

const ADMIN_ITEMS: NavItem[] = [
  { id: 'guests',   label: 'Cuentas Guest', icon: <Users size={16} />,    path: '/guests' },
  { id: 'settings', label: 'Configuración', icon: <Settings size={16} />, path: '/settings' },
]

// ─── Sidebar ────────────────────────────────────────────────────────────────────

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Dot badge for PDF jobs with active status
  const { data: pdfJobs = [] } = usePdfJobs()
  const hasActivePdf = pdfJobs.some(
    (j) => j.status === 'pending' || j.status === 'processing',
  )

  const isActive = (path: string) =>
    pathname === path || (path !== '/dashboard' && pathname.startsWith(path))

  const handleNavigation = (path: string) => {
    navigate(path)
    onMobileClose?.()
  }

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
      {/* Mobile close button */}
      {mobileOpen && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 12px 0' }}>
          <button className="sidebar-toggle" onClick={onMobileClose} title="Cerrar menú">
            <X size={14} />
          </button>
        </div>
      )}

      <div>
        {/* Work section */}
        <div className="sidebar-group">
          <span className="sidebar-group-label">Trabajo</span>
        </div>
        {WORK_ITEMS.map((item) => {
          const hasBadge = item.id === 'pdfs' && hasActivePdf
          return (
            <div
              key={item.id}
              className={`nav-item${isActive(item.path) ? ' active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              title={collapsed && !mobileOpen ? item.label : undefined}
            >
              {item.icon}
              <span className="nav-label">{item.label}</span>
              {hasBadge && !collapsed && <span className="nav-badge" />}
              {hasBadge && collapsed && !mobileOpen && (
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 7, height: 7,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                }} />
              )}
            </div>
          )
        })}

        {/* Admin section */}
        <div className="sidebar-group" style={{ marginTop: 8 }}>
          <span className="sidebar-group-label">Admin</span>
        </div>
        {ADMIN_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`nav-item${isActive(item.path) ? ' active' : ''}`}
            onClick={() => handleNavigation(item.path)}
            title={collapsed && !mobileOpen ? item.label : undefined}
          >
            {item.icon}
            <span className="nav-label">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Footer: version + collapse toggle */}
      <div className="sidebar-footer">
        <span className="sidebar-version">v1.0</span>
        {!mobileOpen && (
          <button
            className="sidebar-toggle"
            onClick={onToggle}
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            style={{ marginLeft: collapsed ? 'auto' : undefined }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>
    </aside>
  )
}

// ─── Topbar ──────────────────────────────────────────────────────────────────────

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard':  'Inicio',
  '/products':   'Productos',
  '/images':     'Imágenes',
  '/categories': 'Categorías',
  '/catalogs':   'Catálogos',
  '/pdf-jobs':   'Trabajos PDF',
  '/guests':     'Cuentas Guest',
  '/settings':   'Configuración',
}

function getPageLabel(pathname: string): string {
  if (pathname.includes('/builder')) return 'Editor de catálogo'
  const match = Object.keys(ROUTE_LABELS).find(
    (k) => k !== '/dashboard' && pathname.startsWith(k),
  ) ?? '/dashboard'
  return ROUTE_LABELS[match] ?? 'Inicio'
}

function getInitials(name?: string, username?: string): string {
  const src = name ?? username ?? '?'
  return src
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function Topbar({ onMobileMenuOpen }: { onMobileMenuOpen?: () => void }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()

  const isHome     = pathname === '/dashboard' || pathname === '/'
  const pageLabel  = getPageLabel(pathname)
  const initials   = getInitials(user?.name, user?.username)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      {/* Left: hamburger (mobile) + brand + breadcrumb */}
      <div className="brand">
        <button
          className="topbar-hamburger"
          onClick={onMobileMenuOpen}
          aria-label="Abrir menú"
          title="Abrir menú"
        >
          <Menu size={18} />
        </button>

        <span className="brand-mark" />
        <span className="brand-name">ALJABA</span>

        <nav className="topbar-breadcrumb" style={{ marginLeft: 16 }}>
          <span className="crumb-sep">/</span>
          {!isHome && (
            <>
              <span style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                Inicio
              </span>
              <span className="crumb-sep">/</span>
            </>
          )}
          <span className="crumb-current">{pageLabel}</span>
        </nav>
      </div>

      {/* Right: theme toggle + avatar + username + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <div className="avatar" title={user?.name ?? user?.username ?? 'Usuario'}>
          {initials}
        </div>

        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--fg-muted)', fontWeight: 500 }}>
          {user?.name?.split(' ')[0] ?? user?.username ?? 'Usuario'}
        </span>

        <button
          className="btn ghost sm"
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <LogOut size={13} /> Salir
        </button>
      </div>
    </header>
  )
}
