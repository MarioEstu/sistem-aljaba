import http from './http'
import type { LoginRequest, LoginResponse } from '@/types'

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await http.post<LoginResponse>('/auth/login', data)
    return res.data
  },

  async me(): Promise<LoginResponse['user']> {
    const res = await http.get<LoginResponse['user']>('/auth/me')
    return res.data
  },
}
