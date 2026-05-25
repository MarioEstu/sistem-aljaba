import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { User as UserIcon, Lock, Save } from 'lucide-react'
import { settingsService } from '@/services/settings.service'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types'

// ── Profile form ──────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
})
type ProfileForm = z.infer<typeof profileSchema>

// ── Password form ─────────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresa la contraseña actual'),
    newPassword:     z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path:    ['confirmPassword'],
  })
type PasswordForm = z.infer<typeof passwordSchema>

// ── Component ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user, setAuth, token } = useAuthStore()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Profile form
  const {
    register:     regProfile,
    handleSubmit: handleProfile,
    formState:    { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver:      zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  })

  // Password form
  const {
    register:     regPassword,
    handleSubmit: handlePassword,
    reset:        resetPassword,
    formState:    { errors: passwordErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSaveProfile = async (data: ProfileForm) => {
    setProfileLoading(true)
    try {
      const updated = await settingsService.updateProfile(data)
      // Keep the store in sync
      if (token && user) {
        setAuth(token, { ...user, name: updated.name } as User)
      }
      toast.success('Perfil actualizado')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'No se pudo actualizar el perfil')
    } finally {
      setProfileLoading(false)
    }
  }

  const onChangePassword = async (data: PasswordForm) => {
    setPasswordLoading(true)
    try {
      await settingsService.changePassword({
        currentPassword: data.currentPassword,
        newPassword:     data.newPassword,
      })
      toast.success('Contraseña actualizada correctamente')
      resetPassword()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'No se pudo cambiar la contraseña')
    } finally {
      setPasswordLoading(false)
    }
  }

  const roleLabel = user?.role === 'admin' ? 'Administrador' : 'Guest'

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="crumbs">Configuración</div>
          <h1>Mi cuenta</h1>
          <p className="desc">Actualiza tu información personal y contraseña.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20, maxWidth: 800 }}>
        {/* ── Profile section ── */}
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <UserIcon size={18} style={{ color: 'var(--accent)' }} />
            <h2 style={{ margin: 0, fontSize: 'var(--fs-md)', fontWeight: 700 }}>Perfil</h2>
          </div>

          {/* Read-only info */}
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Usuario</label>
            <input
              className="input"
              value={user?.username ?? ''}
              readOnly
              style={{ background: 'var(--bg-subtle)', cursor: 'not-allowed', color: 'var(--fg-subtle)' }}
            />
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--fg-subtle)' }}>
              El nombre de usuario no se puede cambiar.
            </span>
          </div>

          <div className="field" style={{ marginBottom: 20 }}>
            <label>Rol</label>
            <input
              className="input"
              value={roleLabel}
              readOnly
              style={{ background: 'var(--bg-subtle)', cursor: 'not-allowed', color: 'var(--fg-subtle)' }}
            />
          </div>

          {/* Editable name */}
          <form onSubmit={handleProfile(onSaveProfile)} noValidate>
            <div className="field" style={{ marginBottom: 18 }}>
              <label htmlFor="name">Nombre completo</label>
              <input
                id="name"
                className={`input${profileErrors.name ? ' error' : ''}`}
                {...regProfile('name')}
              />
              {profileErrors.name && (
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--danger)' }}>
                  {profileErrors.name.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn primary"
              disabled={profileLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Save size={14} />
              {profileLoading ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        {/* ── Password section ── */}
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Lock size={18} style={{ color: 'var(--accent)' }} />
            <h2 style={{ margin: 0, fontSize: 'var(--fs-md)', fontWeight: 700 }}>Contraseña</h2>
          </div>

          <form onSubmit={handlePassword(onChangePassword)} noValidate>
            <div className="field" style={{ marginBottom: 14 }}>
              <label htmlFor="currentPassword">Contraseña actual</label>
              <input
                id="currentPassword"
                type="password"
                className={`input${passwordErrors.currentPassword ? ' error' : ''}`}
                autoComplete="current-password"
                {...regPassword('currentPassword')}
              />
              {passwordErrors.currentPassword && (
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--danger)' }}>
                  {passwordErrors.currentPassword.message}
                </span>
              )}
            </div>

            <div className="field" style={{ marginBottom: 14 }}>
              <label htmlFor="newPassword">Nueva contraseña</label>
              <input
                id="newPassword"
                type="password"
                className={`input${passwordErrors.newPassword ? ' error' : ''}`}
                autoComplete="new-password"
                {...regPassword('newPassword')}
              />
              {passwordErrors.newPassword && (
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--danger)' }}>
                  {passwordErrors.newPassword.message}
                </span>
              )}
            </div>

            <div className="field" style={{ marginBottom: 20 }}>
              <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                className={`input${passwordErrors.confirmPassword ? ' error' : ''}`}
                autoComplete="new-password"
                {...regPassword('confirmPassword')}
              />
              {passwordErrors.confirmPassword && (
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--danger)' }}>
                  {passwordErrors.confirmPassword.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn primary"
              disabled={passwordLoading}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Lock size={14} />
              {passwordLoading ? 'Actualizando…' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
