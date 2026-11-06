import type {
  DashboardStats,
  Task,
  TaskFilters,
  TaskInput,
  TaskStatus,
  TeamMember,
  TeamMemberInput,
} from '../types'
import { request } from './client'

export const tasksApi = {
  list(filters: TaskFilters = {}) {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.priority) params.set('priority', filters.priority)
    if (filters.search?.trim()) params.set('search', filters.search.trim())
    const query = params.toString()
    return request<Task[]>(`/tasks${query ? `?${query}` : ''}`)
  },
  get: (id: number) => request<Task>(`/tasks/${id}`),
  create: (input: TaskInput) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, input: TaskInput) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  updateStatus: (id: number, status: TaskStatus) =>
    request<Task>(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  /** Pass `null` to unassign the task. */
  assign: (id: number, teamMemberId: number | null) =>
    request<Task>(`/tasks/${id}/assignee`, { method: 'PATCH', body: JSON.stringify({ teamMemberId }) }),
  remove: (id: number) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
}

export const teamMembersApi = {
  list: () => request<TeamMember[]>('/team-members'),
  create: (input: TeamMemberInput) =>
    request<TeamMember>('/team-members', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, input: TeamMemberInput) =>
    request<TeamMember>(`/team-members/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: number) => request<void>(`/team-members/${id}`, { method: 'DELETE' }),
}

export const dashboardApi = {
  stats: () => request<DashboardStats>('/dashboard/stats'),
}
