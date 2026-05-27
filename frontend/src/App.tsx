import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ThemeProvider }       from '@/context/ThemeContext'
import AdminLayout             from '@/components/layout/AdminLayout'
import GuestLayout             from '@/components/layout/GuestLayout'
import LoginPage               from '@/pages/LoginPage'
import DashboardPage           from '@/pages/DashboardPage'
import ProductsPage            from '@/pages/products/ProductsPage'
import CategoriesPage          from '@/pages/categories/CategoriesPage'
import ImagesPage              from '@/pages/images/ImagesPage'
import CatalogsPage            from '@/pages/catalogs/CatalogsPage'
import CatalogBuilderPage      from '@/pages/catalogs/CatalogBuilderPage'
import CatalogViewPage         from '@/pages/catalogs/CatalogViewPage'
import PdfJobsPage             from '@/pages/pdf-jobs/PdfJobsPage'
import GuestsPage              from '@/pages/guests/GuestsPage'
import SettingsPage            from '@/pages/settings/SettingsPage'
import GuestPortalPage         from '@/pages/portal/GuestPortalPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/view/:slug"     element={<CatalogViewPage />} />

            {/* Guest portal (role: guest, requires auth) */}
            <Route element={<GuestLayout />}>
              <Route path="/portal" element={<GuestPortalPage />} />
            </Route>

            {/* Admin panel (role: admin, requires auth) */}
            <Route element={<AdminLayout />}>
              <Route path="/dashboard"               element={<DashboardPage />} />
              <Route path="/products"                element={<ProductsPage />} />
              <Route path="/categories"              element={<CategoriesPage />} />
              <Route path="/images"                  element={<ImagesPage />} />
              <Route path="/catalogs"                element={<CatalogsPage />} />
              <Route path="/catalogs/:id/builder"    element={<CatalogBuilderPage />} />
              <Route path="/pdf-jobs"                element={<PdfJobsPage />} />
              <Route path="/guests"                  element={<GuestsPage />} />
              <Route path="/settings"                element={<SettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
