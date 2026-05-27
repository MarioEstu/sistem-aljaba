import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Sidebar, { Topbar } from './Sidebar'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'

export default function AdminLayout() {
  const { isAuthenticated, user, setUser } = useAuthStore()
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Refresh user data from the server on every mount so the displayed name
  // is always up-to-date (handles cached stale data in localStorage).
  useEffect(() => {
    if (isAuthenticated) {
      authService.me().then(setUser).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Guests belong in the guest portal
  if (user?.role === 'guest') {
    return <Navigate to="/portal" replace />
  }

  const sidebarWidth = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)'

  return (
    <div
      className="app-layout"
      style={{ gridTemplateColumns: `${sidebarWidth} 1fr` }}
    >
      <Topbar onMobileMenuOpen={() => setMobileOpen(true)} />

      {/* Mobile backdrop — closes sidebar when tapped outside */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
