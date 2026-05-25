import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersService, type CreateUserPayload, type UpdateUserPayload } from '@/services/users.service'

export const USERS_KEY = 'users'

export function useUsers() {
  return useQuery({
    queryKey: [USERS_KEY],
    queryFn:  () => usersService.list(),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [USERS_KEY, id],
    queryFn:  () => usersService.getById(id),
    enabled:  !!id,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserPayload) => usersService.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      usersService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      usersService.changePassword(id, password),
  })
}

export function useToggleUserActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersService.toggleActive(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  })
}
