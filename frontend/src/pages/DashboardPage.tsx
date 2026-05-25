import { Package, Image, BookOpen, FileText } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

const STATS = [
  { label: 'Productos',    value: '—',  hint: 'sin datos aún',          icon: <Package size={18} />, warn: false },
  { label: 'Imágenes',     value: '—',  hint: 'sin datos aún',          icon: <Image size={18} />,   warn: false },
  { label: 'Catálogos',    value: '—',  hint: 'sin catálogos creados',  icon: <BookOpen size={18} />,warn: false },
  { label: 'Trabajos PDF', value: '—',  hint: 'sin trabajos pendientes',icon: <FileText size={18} />,warn: false },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs">Inicio</div>
          <h1>{greeting}, {user?.name?.split(' ')[0] ?? 'Admin'}</h1>
          <p className="desc">
            Bienvenido a Catalog Aljaba. Aquí verás el resumen del sistema en tiempo real.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn secondary">Importar CSV</button>
          <button className="btn primary">Nuevo catálogo</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {STATS.map((s, i) => (
          <div key={i} className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="eyebrow">{s.label}</span>
              <span style={{ color: 'var(--fg-subtle)' }}>{s.icon}</span>
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                marginTop: 8,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: s.warn ? 'var(--warn)' : 'var(--fg-subtle)', marginTop: 4 }}>
              {s.hint}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="card dashed card-pad" style={{ textAlign: 'center', padding: 48, color: 'var(--fg-subtle)' }}>
        <p style={{ margin: 0, fontSize: 'var(--fs-md)', fontWeight: 600 }}>
          Sistema listo para configurar
        </p>
        <p className="p-sm" style={{ margin: '8px 0 0' }}>
          Fase 1 completada: autenticación y shell del admin funcionando.
          <br />
          Próximo: módulo de Productos (Fase 2).
        </p>
      </div>
    </div>
  )
}
