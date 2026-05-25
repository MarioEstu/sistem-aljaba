import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, KeyRound, Pencil, Plus, Power, Search, Trash2, X } from 'lucide-react'
import {
  useChangePassword,
  useCreateUser,
  useDeleteUser,
  useToggleUserActive,
  useUpdateUser,
  useUsers,
} from '@/hooks/useUsers'
import { useAuthStore } from '@/store/auth.store'
import type { Role } from '@/types'
import type { UserDetail } from '@/services/users.service'
import ConfirmModal from '@/components/ui/ConfirmModal'

// ── Schemas ────────────────────────────────────────────────────────────────────
const createSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(32, 'Máximo 32 caracteres')
    .regex(/^[a-z0-9_.-]+$/i, 'Solo letras, números, guiones y puntos'),
  name:     z.string().min(2, 'Mínimo 2 caracteres').max(80),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role:     z.enum(['admin', 'guest'] as const),
})

const editSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  role: z.enum(['admin', 'guest'] as const),
})

const pwdSchema = z.object({
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Las contraseñas no coinciden',
  path:    ['confirm'],
})

type CreateForm = z.infer<typeof createSchema>
type EditForm   = z.infer<typeof editSchema>
type PwdForm    = z.infer<typeof pwdSchema>

// ── Role badge ─────────────────────────────────────────────────────────────────
function RolePill({ role }: { role: Role }) {
  return (
    <span className={`pill ${role === 'admin' ? 'ok' : 'dim'}`}>
      {role === 'admin' ? 'Admin' : 'Invitado'}
    </span>
  )
}

// ── User Form Modal ─────────────────────────────────────────────────────────────
function UserFormModal({
  user,
  onClose,
}: {
  user?:    UserDetail | null
  onClose:  () => void
}) {
  const isEdit  = !!user
  const create  = useCreateUser()
  const update  = useUpdateUser()
  const [showPwd, setShowPwd] = useState(false)
  const { user: me } = useAuthStore()

  const {
    register: regCreate,
    handleSubmit: hsCreate,
    formState: { errors: errCreate, isSubmitting: subCreate },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema), defaultValues: { role: 'guest' as const } })

  const {
    register: regEdit,
    handleSubmit: hsEdit,
    formState: { errors: errEdit, isSubmitting: subEdit },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: user ? { name: user.name, role: user.role } : undefined,
  })

  const onCreateSubmit = async (data: CreateForm) => {
    await create.mutateAsync(data)
    onClose()
  }

  const onEditSubmit = async (data: EditForm) => {
    await update.mutateAsync({ id: user!.id, data })
    onClose()
  }

  const isMe = me?.id === user?.id

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(31,30,26,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 480 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ margin: 0, fontSize: 'var(--fs-lg)', fontWeight: 700 }}>
            {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
          </h2>
          <button className="btn ghost sm" onClick={onClose}><X size={16} /></button>
        </div>

        <div style={{ padding: 20 }}>
          {isEdit ? (
            <form onSubmit={hsEdit(onEditSubmit)}>
              <div className="field" style={{ marginBottom: 14 }}>
                <label>Nombre completo *</label>
                <input className={`input${errEdit.name ? ' error' : ''}`} {...regEdit('name')} />
                {errEdit.name && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errEdit.name.message}</span>}
              </div>
              <div className="field" style={{ marginBottom: 20 }}>
                <label>Rol</label>
                <select
                  className="input"
                  disabled={isMe}
                  title={isMe ? 'No puedes cambiar tu propio rol' : ''}
                  {...regEdit('role')}
                >
                  <option value="guest">Invitado (rutero)</option>
                  <option value="admin">Administrador</option>
                </select>
                {isMe && (
                  <p className="p-sm" style={{ margin: '4px 0 0', color: 'var(--fg-subtle)' }}>
                    No puedes cambiar tu propio rol.
                  </p>
                )}
              </div>
              {(update.error) && (
                <div style={{ background: 'var(--danger-tint)', color: 'var(--danger)', padding: '10px 12px', borderRadius: 'var(--r-md)', fontSize: 'var(--fs-sm)', marginBottom: 14 }}>
                  {(update.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al actualizar'}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn primary" disabled={subEdit}>
                  {subEdit ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={hsCreate(onCreateSubmit)}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="field">
                  <label>Usuario *</label>
                  <input className={`input mono${errCreate.username ? ' error' : ''}`} {...regCreate('username')} autoComplete="off" />
                  {errCreate.username && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errCreate.username.message}</span>}
                </div>
                <div className="field">
                  <label>Rol</label>
                  <select className="input" {...regCreate('role')}>
                    <option value="guest">Invitado (rutero)</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="field" style={{ marginBottom: 14 }}>
                <label>Nombre completo *</label>
                <input className={`input${errCreate.name ? ' error' : ''}`} {...regCreate('name')} />
                {errCreate.name && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errCreate.name.message}</span>}
              </div>
              <div className="field" style={{ marginBottom: 20 }}>
                <label>Contraseña *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={`input${errCreate.password ? ' error' : ''}`}
                    style={{ paddingRight: 40 }}
                    autoComplete="new-password"
                    {...regCreate('password')}
                  />
                  <button
                    type="button"
                    className="btn ghost sm"
                    style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}
                    onClick={() => setShowPwd((v) => !v)}
                  >
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errCreate.password && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errCreate.password.message}</span>}
              </div>
              {create.error && (
                <div style={{ background: 'var(--danger-tint)', color: 'var(--danger)', padding: '10px 12px', borderRadius: 'var(--r-md)', fontSize: 'var(--fs-sm)', marginBottom: 14 }}>
                  {(create.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al crear usuario'}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn primary" disabled={subCreate}>
                  {subCreate ? 'Creando…' : 'Crear usuario'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Password Modal ──────────────────────────────────────────────────────────────
function PasswordModal({ user, onClose }: { user: UserDetail; onClose: () => void }) {
  const changePwd = useChangePassword()
  const [showPwd, setShowPwd] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<PwdForm>({ resolver: zodResolver(pwdSchema) })

  const onSubmit = async (data: PwdForm) => {
    await changePwd.mutateAsync({ id: user.id, password: data.password })
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(31,30,26,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--fs-lg)', fontWeight: 700 }}>
            Cambiar contraseña — {user.name}
          </h2>
          <button className="btn ghost sm" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 20 }}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Nueva contraseña *</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className={`input${errors.password ? ' error' : ''}`}
                style={{ paddingRight: 40 }}
                autoComplete="new-password"
                {...register('password')}
              />
              <button type="button" className="btn ghost sm" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }} onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.password.message}</span>}
          </div>
          <div className="field" style={{ marginBottom: 20 }}>
            <label>Confirmar contraseña *</label>
            <input type={showPwd ? 'text' : 'password'} className={`input${errors.confirm ? ' error' : ''}`} autoComplete="new-password" {...register('confirm')} />
            {errors.confirm && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errors.confirm.message}</span>}
          </div>
          {changePwd.error && (
            <div style={{ background: 'var(--danger-tint)', color: 'var(--danger)', padding: '10px 12px', borderRadius: 'var(--r-md)', fontSize: 'var(--fs-sm)', marginBottom: 14 }}>
              Error al cambiar contraseña
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GuestsPage() {
  const { data: users = [], isLoading } = useUsers()
  const toggleActive = useToggleUserActive()
  const deleteUser   = useDeleteUser()
  const { user: me } = useAuthStore()

  const [search,        setSearch]        = useState('')
  const [roleFilter,    setRoleFilter]    = useState<'all' | 'admin' | 'guest'>('all')
  const [statusFilter,  setStatusFilter]  = useState<'all' | 'active' | 'inactive'>('all')
  const [showForm,      setShowForm]      = useState(false)
  const [editUser,      setEditUser]      = useState<UserDetail | null>(null)
  const [pwdUser,       setPwdUser]       = useState<UserDetail | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<UserDetail | null>(null)

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter   !== 'all' && u.role !== roleFilter) return false
      if (statusFilter === 'active'   && !u.active) return false
      if (statusFilter === 'inactive' &&  u.active) return false
      if (search) {
        const q = search.toLowerCase()
        return u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
      }
      return true
    })
  }, [users, roleFilter, statusFilter, search])

  const admins  = users.filter((u) => u.role === 'admin').length
  const guests  = users.filter((u) => u.role === 'guest').length
  const active  = users.filter((u) => u.active).length
  const inactive = users.filter((u) => !u.active).length

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs">Admin · Usuarios</div>
          <h1>Gestión de usuarios</h1>
          <p className="desc">
            {isLoading ? 'Cargando…' : `${users.length} usuarios · ${admins} administradores · ${guests} invitados`}
          </p>
        </div>
        <button className="btn primary" onClick={() => { setEditUser(null); setShowForm(true) }}>
          <Plus size={14} /> Nuevo usuario
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total',        value: users.length, color: 'var(--fg)' },
          { label: 'Admins',       value: admins,       color: 'var(--ok)' },
          { label: 'Invitados',    value: guests,       color: 'var(--fg-muted)' },
          { label: 'Inactivos',    value: inactive,     color: 'var(--warn)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card card-pad" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
            <div className="p-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: 12, alignItems: 'end' }}>
          <div className="field">
            <label>Buscar</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-subtle)' }} />
              <input className="input" style={{ paddingLeft: 32 }} placeholder="Nombre o usuario…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Rol</label>
            <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}>
              <option value="all">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="guest">Invitado</option>
            </select>
          </div>
          <div className="field">
            <label>Estado</label>
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {!isLoading && filtered.length === 0 ? (
        <div className="card dashed card-pad" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>
            {search || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'Sin resultados para ese filtro'
              : 'No hay usuarios registrados'}
          </p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Catálogos creados</th>
                <th>Trabajos PDF</th>
                <th>Creado</th>
                <th style={{ width: 200 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const isMe = me?.id === user.id
                return (
                  <tr key={user.id} style={{ opacity: user.active ? 1 : 0.55 }}>
                    <td>
                      <span className="mono" style={{ fontWeight: 600 }}>{user.username}</span>
                      {isMe && <span className="pill dim" style={{ marginLeft: 6, fontSize: 10 }}>tú</span>}
                    </td>
                    <td>{user.name}</td>
                    <td><RolePill role={user.role} /></td>
                    <td>
                      <span className={`pill ${user.active ? 'ok' : 'warn'}`}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{user.catalogsCount}</td>
                    <td style={{ textAlign: 'center' }}>{user.pdfJobsCount}</td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString('es-GT')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <button
                          className="btn secondary sm"
                          title="Editar"
                          onClick={() => { setEditUser(user); setShowForm(true) }}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          className="btn secondary sm"
                          title="Cambiar contraseña"
                          onClick={() => setPwdUser(user)}
                        >
                          <KeyRound size={12} />
                        </button>
                        <button
                          className="btn ghost sm"
                          title={user.active ? 'Desactivar' : 'Activar'}
                          disabled={isMe || toggleActive.isPending}
                          onClick={() => toggleActive.mutate(user.id)}
                          style={{ color: user.active ? 'var(--warn)' : 'var(--ok)' }}
                        >
                          <Power size={12} />
                        </button>
                        <button
                          className="btn ghost sm"
                          title="Eliminar"
                          disabled={isMe}
                          style={{ color: 'var(--danger)' }}
                          onClick={() => setDeleteTarget(user)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats bar bottom */}
      {!isLoading && users.length > 0 && (
        <div className="p-sm" style={{ marginTop: 10, color: 'var(--fg-subtle)' }}>
          Mostrando {filtered.length} de {users.length} usuarios &nbsp;·&nbsp; {active} activos · {inactive} inactivos
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <UserFormModal
          user={editUser}
          onClose={() => { setShowForm(false); setEditUser(null) }}
        />
      )}

      {pwdUser && (
        <PasswordModal
          user={pwdUser}
          onClose={() => setPwdUser(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Eliminar usuario"
          message={`¿Eliminar a "${deleteTarget.name}" (@${deleteTarget.username})? Esta acción no se puede deshacer.`}
          loading={deleteUser.isPending}
          onConfirm={async () => {
            await deleteUser.mutateAsync(deleteTarget.id)
            setDeleteTarget(null)
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
