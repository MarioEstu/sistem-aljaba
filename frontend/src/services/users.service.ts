import http from './http'
import type { User, Role } from '@/types'

export interface UserDetail extends User {
  pdfJobsCount: number
  catalogsCount: number
}

export interface CreateUserPayload {
  username: string
  name:     string
  password: string
  role:     Role
  active?:  boolean
}

export interface UpdateUserPayload {
  name?:   string
  role?:   Role
  active?: boolean
}

export const usersService = {
  list: () =>
    http.get<UserDetail[]>('/users').then((r) => r.data),

  getById: (id: string) =>
    http.get<UserDetail>(`/users/${id}`).then((r) => r.data),

  create: (data: CreateUserPayload) =>
    http.post<User>('/users', data).then((r) => r.data),

  update: (id: string, data: UpdateUserPayload) =>
    http.put<User>(`/users/${id}`, data).then((r) => r.data),

  changePassword: (id: string, password: string) =>
    http.patch<{ ok: boolean }>(`/users/${id}/password`, { password }).then((r) => r.data),

  toggleActive: (id: string) =>
    http.patch<User>(`/users/${id}/toggle-active`).then((r) => r.data),

  delete: (id: string) =>
    http.delete<{ deleted: boolean; userId: string }>(`/users/${id}`).then((r) => r.data),
}
