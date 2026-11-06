import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api'
import { AlertIcon, CalendarIcon, CheckCircleIcon, ClockIcon, PlusIcon, TasksIcon, UsersIcon } from '../components/icons'
import { AssigneeName, Card, EmptyState, ErrorState, PageHeader, PriorityBadge, Spinner, StatusBadge } from '../components/ui'
import { buttonClass } from '../lib/styles'
import { useAsync } from '../hooks/useAsync'
import {
  PRIORITY_LABELS,
  PRIORITY_STYLES,
  STATUS_LABELS,
  STATUS_STYLES,
  formatDateTime,
  isOverdue,
  relativeDueDate,
} from '../lib/format'
import { TASK_PRIORITIES, TASK_STATUSES, type Task } from '../types'

function StatTile({ label, value, hint, icon, tone }: { label: string; value: ReactNode; hint: string; icon: ReactNode; tone: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`grid size-9 place-items-center rounded-lg ${tone}`}>{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </Card>
  )
}

/** Horizontal bar list: one labelled row per category, so identity never relies on color alone. */
function DistributionBars({ rows, total }: { rows: { key: string; label: string; count: number; color: string }[]; total: number }) {
  return (
    <ul className="space-y-4">
      {rows.map((row) => {
        const percent = total === 0 ? 0 : Math.round((row.count / total) * 100)
        return (
          <li key={row.key}>
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
              <span className="font-medium text-slate-700">{row.label}</span>
              <span className="tabular-nums text-slate-500">
                {row.count} <span className="text-slate-400">· {percent}%</span>
              </span>
            </div>
            <div
              className="h-2 w-full rounded-full bg-slate-100"
              role="img"
              aria-label={`${row.label}: ${row.count} tasks (${percent}%)`}
              title={`${row.label}: ${row.count} of ${total} tasks (${percent}%)`}
            >
              <div className={`h-2 rounded-full ${row.color} transition-all`} style={{ width: `${percent}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function TaskRow({ task, meta }: { task: Task; meta: ReactNode }) {
  return (
    <li>
      <Link to={`/tasks/${task.id}`} className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-slate-50">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{task.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{meta}</p>
          <div className="mt-1 text-xs text-slate-500">
            <AssigneeName assignee={task.assignee} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <span className="hidden sm:inline-flex">
            <StatusBadge status={task.status} />
          </span>
        </div>
      </Link>
    </li>
  )
}

export default function DashboardPage() {
  const { data: stats, error, loading, reload } = useAsync(() => dashboardApi.stats(), 'dashboard')

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your team's work."
        actions={
          <Link to="/tasks/new" className={buttonClass('primary')}>
            <PlusIcon className="size-4" /> New task
          </Link>
        }
      />

      {loading && !stats && <Spinner label="Loading dashboard…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {stats && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Total tasks"
              value={stats.totalTasks}
              hint={`${stats.openTasks} open · ${stats.teamMemberCount} team members`}
              icon={<TasksIcon className="size-5" />}
              tone="bg-indigo-50 text-indigo-600"
            />
            <StatTile
              label="Completed"
              value={`${stats.completionRate}%`}
              hint={`${stats.completedTasks} of ${stats.totalTasks} tasks done`}
              icon={<CheckCircleIcon className="size-5" />}
              tone="bg-emerald-50 text-emerald-600"
            />
            <StatTile
              label="Overdue"
              value={stats.overdueTasks}
              hint="Open tasks past their due date"
              icon={<AlertIcon className="size-5" />}
              tone="bg-red-50 text-red-600"
            />
            <StatTile
              label="Due this week"
              value={stats.dueThisWeek}
              hint="Open tasks due in the next 7 days"
              icon={<ClockIcon className="size-5" />}
              tone="bg-amber-50 text-amber-600"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-5 text-base font-semibold text-slate-900">Tasks by status</h2>
              <DistributionBars
                total={stats.totalTasks}
                rows={TASK_STATUSES.map((status) => ({
                  key: status,
                  label: STATUS_LABELS[status],
                  count: stats.tasksByStatus[status] ?? 0,
                  color: STATUS_STYLES[status].bar,
                }))}
              />
            </Card>
            <Card className="p-5">
              <h2 className="mb-5 text-base font-semibold text-slate-900">Tasks by priority</h2>
              <DistributionBars
                total={stats.totalTasks}
                rows={[...TASK_PRIORITIES].reverse().map((priority) => ({
                  key: priority,
                  label: PRIORITY_LABELS[priority],
                  count: stats.tasksByPriority[priority] ?? 0,
                  color: PRIORITY_STYLES[priority].bar,
                }))}
              />
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <CalendarIcon className="size-4 text-slate-400" /> Upcoming deadlines
                </h2>
                <Link to="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  View all
                </Link>
              </div>
              {stats.upcomingTasks.length === 0 ? (
                <EmptyState title="Nothing due" description="No open tasks have a due date." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {stats.upcomingTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      meta={
                        <span className={isOverdue(task.dueDate, task.status) ? 'font-medium text-red-600' : ''}>
                          {relativeDueDate(task.dueDate)}
                        </span>
                      }
                    />
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <ClockIcon className="size-4 text-slate-400" /> Recently updated
                </h2>
                <Link to="/team" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  <UsersIcon className="size-4" /> Team
                </Link>
              </div>
              {stats.recentTasks.length === 0 ? (
                <EmptyState title="No tasks yet" description="Create your first task to see activity here." />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {stats.recentTasks.map((task) => (
                    <TaskRow key={task.id} task={task} meta={`Updated ${formatDateTime(task.updatedAt)}`} />
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  )
}
