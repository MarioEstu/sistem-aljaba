import http from './http'
import type { User } from '@/types'

export interface UpdateProfilePayload {
  name: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export const settingsService = {
  getProfile(): Promise<User> {
    return http.get<User>('/settings/me').then((r) => r.data)
  },

  updateProfile(payload: UpdateProfilePayload): Promise<User> {
    return http.put<User>('/settings/me', payload).then((r) => r.data)
  },

  changePassword(payload: ChangePasswordPayload): Promise<{ ok: boolean }> {
    return http.patch<{ ok: boolean }>('/settings/me/password', payload).then((r) => r.data)
  },
}
