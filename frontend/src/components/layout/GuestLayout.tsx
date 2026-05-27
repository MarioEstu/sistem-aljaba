import { useEffect } from 'react'
import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'

export default function GuestLayout() {
  const { isAuthenticated, user, logout, setUser } = useAuthStore()
  const navigate = useNavigate()

  // Refresh user data from server on mount to fix stale names stored in localStorage
  useEffect(() => {
    if (isAuthenticated) {
      authService.me().then(setUser).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Admins should use the admin panel, not the guest portal
  if (user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top header */}
      <header
        style={{
          height: 52,
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 12,
          background: 'var(--surface)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <span
            style={{
              display: 'inline-block',
              width: 4,
              height: 20,
              background: 'var(--accent)',
              borderRadius: 2,
            }}
          />
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>ALJABA</span>
          <span style={{ fontSize: 10, color: 'var(--fg-subtle)', letterSpacing: '0.12em', fontWeight: 500 }}>
            CATALOG
          </span>
        </div>

        {/* User info + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: 'var(--fs-sm)',
              color: 'var(--fg-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <UserIcon size={13} />
            {user?.name ?? user?.username ?? 'Usuario'}
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

      {/* Page content */}
      <div style={{ flex: 1, padding: '24px 28px', maxWidth: 1100, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <Outlet />
      </div>
    </div>
  )
}
