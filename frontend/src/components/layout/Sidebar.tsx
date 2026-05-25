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
  User as UserIcon,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  count?: string
}

const WORK_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Inicio',        icon: <LayoutGrid size={16} />,  path: '/dashboard' },
  { id: 'products',    label: 'Productos',      icon: <Package size={16} />,     path: '/products',    count: undefined },
  { id: 'images',      label: 'Imágenes',       icon: <ImageIcon size={16} />,   path: '/images' },
  { id: 'categories',  label: 'Categorías',     icon: <Folder size={16} />,      path: '/categories' },
  { id: 'catalogs',    label: 'Catálogos',      icon: <BookOpen size={16} />,    path: '/catalogs' },
  { id: 'pdfs',        label: 'Trabajos PDF',   icon: <FileText size={16} />,    path: '/pdf-jobs' },
]

const ADMIN_ITEMS: NavItem[] = [
  { id: 'guests',   label: 'Cuentas Guest', icon: <Users size={16} />,    path: '/guests' },
  { id: 'settings', label: 'Configuración', icon: <Settings size={16} />, path: '/settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isActive = (path: string) => pathname === path || (path !== '/dashboard' && pathname.startsWith(path))

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-group">Trabajo</div>
        {WORK_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`nav-item${isActive(item.path) ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.count && <span className="nav-count">{item.count}</span>}
          </div>
        ))}

        <div className="sidebar-group" style={{ marginTop: 8 }}>Administración</div>
        {ADMIN_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`nav-item${isActive(item.path) ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', padding: '12px 16px', fontSize: 11, color: 'var(--fg-subtle)' }}>
        v1.0 · Fase 7
      </div>
    </aside>
  )
}

export function Topbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark" />
        <span className="brand-name">ALJABA</span>
        <span className="brand-sub" style={{ marginLeft: 6 }}>CATALOG · ADMIN</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserIcon size={14} />
          {user?.name ?? user?.username ?? 'Usuario'}
        </span>
        <button className="btn ghost sm" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <LogOut size={13} /> Salir
        </button>
      </div>
    </header>
  )
}
