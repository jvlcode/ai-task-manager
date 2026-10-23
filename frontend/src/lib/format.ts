import type { TaskPriority, TaskStatus } from '../types'

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const STATUS_STYLES: Record<TaskStatus, { badge: string; bar: string }> = {
  TODO: { badge: 'bg-slate-100 text-slate-700 ring-slate-200', bar: 'bg-slate-400' },
  IN_PROGRESS: { badge: 'bg-blue-50 text-blue-700 ring-blue-200', bar: 'bg-blue-500' },
  IN_REVIEW: { badge: 'bg-amber-50 text-amber-800 ring-amber-200', bar: 'bg-amber-500' },
  DONE: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', bar: 'bg-emerald-500' },
}

export const PRIORITY_STYLES: Record<TaskPriority, { badge: string; dot: string; bar: string }> = {
  LOW: { badge: 'bg-slate-50 text-slate-600 ring-slate-200', dot: 'bg-slate-400', bar: 'bg-slate-400' },
  MEDIUM: { badge: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500', bar: 'bg-sky-500' },
  HIGH: { badge: 'bg-orange-50 text-orange-700 ring-orange-200', dot: 'bg-orange-500', bar: 'bg-orange-500' },
  URGENT: { badge: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500', bar: 'bg-red-500' },
}

/** Parses a YYYY-MM-DD string as a local calendar date, avoiding the UTC shift of `new Date(iso)`. */
function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function formatDate(isoDate: string | null): string {
  if (!isoDate) return 'No due date'
  return parseLocalDate(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(isoDateTime: string): string {
  return new Date(isoDateTime).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function isOverdue(dueDate: string | null, status: TaskStatus): boolean {
  if (!dueDate || status === 'DONE') return false
  return parseLocalDate(dueDate) < startOfToday()
}

/** Human-friendly distance to a due date, e.g. "Due today", "3 days overdue", "In 5 days". */
export function relativeDueDate(dueDate: string | null): string {
  if (!dueDate) return 'No due date'
  const days = Math.round((parseLocalDate(dueDate).getTime() - startOfToday().getTime()) / 86_400_000)
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days === -1) return '1 day overdue'
  if (days < 0) return `${-days} days overdue`
  return `In ${days} days`
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
]

export function avatarColor(seed: string): string {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!
}
