export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export const TASK_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']
export const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

/** Compact team member view embedded in task responses. */
export interface TeamMemberSummary {
  id: number
  fullName: string
  email: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  /** ISO date (YYYY-MM-DD) */
  dueDate: string | null
  /** `null` when the task is unassigned. */
  assignee: TeamMemberSummary | null
  createdAt: string
  updatedAt: string
}

export interface TaskInput {
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
}

export interface TaskFilters {
  status?: TaskStatus | ''
  priority?: TaskPriority | ''
  search?: string
}

export interface TeamMember {
  id: number
  fullName: string
  email: string
  role: string
  department: string | null
  createdAt: string
  updatedAt: string
}

export interface TeamMemberInput {
  fullName: string
  email: string
  role: string
  department: string | null
}

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  openTasks: number
  overdueTasks: number
  dueThisWeek: number
  completionRate: number
  teamMemberCount: number
  tasksByStatus: Record<TaskStatus, number>
  tasksByPriority: Record<TaskPriority, number>
  recentTasks: Task[]
  upcomingTasks: Task[]
}
