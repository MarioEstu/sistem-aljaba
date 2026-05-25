import { Outlet, Navigate } from 'react-router-dom'
import Sidebar, { Topbar } from './Sidebar'
import { useAuthStore } from '@/store/auth.store'

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Guests belong in the guest portal
  if (user?.role === 'guest') {
    return <Navigate to="/portal" replace />
  }

  return (
    <div className="app-layout">
      <Topbar />
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
