import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types'

const loginSchema = z.object({
  username: z.string().min(1, 'Ingresa tu nombre de usuario'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    setApiError(null)
    try {
      const { token, user } = await authService.login(data)
      setAuth(token, user as User)
      navigate(user.role === 'guest' ? '/portal' : '/dashboard', { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
      setApiError(msg || 'Usuario o contraseña incorrectos')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <div className="card card-pad" style={{ width: 380 }}>
        {/* Logo / Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <span
            style={{
              display: 'inline-block',
              width: 4,
              height: 22,
              background: 'var(--accent)',
              borderRadius: 2,
            }}
          />
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em' }}>
            ALJABA
          </span>
          <span
            style={{
              fontSize: 11,
              color: 'var(--fg-subtle)',
              letterSpacing: '0.1em',
              fontWeight: 500,
            }}
          >
            CATALOG
          </span>
        </div>

        {/* Heading */}
        <h2 style={{ margin: '0 0 4px', fontSize: 'var(--fs-xl)', fontWeight: 700 }}>
          Iniciar sesión
        </h2>
        <p className="p-sm" style={{ margin: '0 0 24px' }}>
          Solo personal autorizado de Aljaba S.A.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field" style={{ marginBottom: 14 }}>
            <label htmlFor="username">Nombre de usuario</label>
            <input
              id="username"
              className={`input${errors.username ? ' error' : ''}`}
              autoComplete="username"
              autoFocus
              {...register('username')}
            />
            {errors.username && (
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--danger)' }}>
                {errors.username.message}
              </span>
            )}
          </div>

          <div className="field" style={{ marginBottom: 22 }}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className={`input${errors.password ? ' error' : ''}`}
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--danger)' }}>
                {errors.password.message}
              </span>
            )}
          </div>

          {/* API error */}
          {apiError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--danger-tint)',
                color: 'var(--danger)',
                padding: '10px 12px',
                borderRadius: 'var(--r-md)',
                fontSize: 'var(--fs-sm)',
                marginBottom: 16,
              }}
            >
              <AlertCircle size={14} />
              {apiError}
            </div>
          )}

          <button
            type="submit"
            className="btn primary full"
            disabled={isSubmitting}
            style={{ fontSize: 'var(--fs-md)' }}
          >
            {isSubmitting ? 'Verificando…' : 'Entrar'}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Footer hint */}
        <div
          style={{
            borderTop: '1px solid var(--border-soft)',
            marginTop: 20,
            paddingTop: 14,
            fontSize: 11,
            color: 'var(--fg-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Lock size={12} />
          Ingresa con tu usuario y contraseña asignados por el administrador.
        </div>
      </div>
    </div>
  )
}
