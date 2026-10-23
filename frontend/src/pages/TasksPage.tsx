import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { tasksApi } from '../api'
import { CalendarIcon, PlusIcon, SearchIcon } from '../components/icons'
import { Card, EmptyState, ErrorState, PageHeader, PriorityBadge, Spinner, StatusBadge } from '../components/ui'
import { buttonClass, inputClass } from '../lib/styles'
import { useAsync } from '../hooks/useAsync'
import { PRIORITY_LABELS, STATUS_LABELS, formatDate, isOverdue } from '../lib/format'
import { TASK_PRIORITIES, TASK_STATUSES, type TaskPriority, type TaskStatus } from '../types'

export default function TasksPage() {
  const navigate = useNavigate()
  // Filters live in the URL so they survive navigation to a task and back.
  const [searchParams, setSearchParams] = useSearchParams()
  const status = (searchParams.get('status') ?? '') as TaskStatus | ''
  const priority = (searchParams.get('priority') ?? '') as TaskPriority | ''
  const search = searchParams.get('search') ?? ''

  const [searchInput, setSearchInput] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  // Debounce typing so the API isn't hit on every keystroke.
  function handleSearchChange(value: string) {
    setSearchInput(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateParam('search', value.trim()), 300)
  }

  function updateParam(key: string, value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  const { data: tasks, error, loading, reload } = useAsync(
    () => tasksApi.list({ status, priority, search }),
    JSON.stringify({ status, priority, search }),
  )

  const hasFilters = Boolean(status || priority || search)

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Create, track and update your team's tasks."
        actions={
          <Link to="/tasks/new" className={buttonClass('primary')}>
            <PlusIcon className="size-4" /> New task
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            className={`${inputClass} pl-9`}
            placeholder="Search by title or description…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search tasks"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:flex">
          <select className={`${inputClass} md:w-44`} value={status} onChange={(e) => updateParam('status', e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select className={`${inputClass} md:w-44`} value={priority} onChange={(e) => updateParam('priority', e.target.value)} aria-label="Filter by priority">
            <option value="">All priorities</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <Card className="overflow-hidden">
          {loading && !tasks ? (
            <Spinner label="Loading tasks…" />
          ) : tasks && tasks.length === 0 ? (
            <EmptyState
              title={hasFilters ? 'No matching tasks' : 'No tasks yet'}
              description={hasFilters ? 'Try adjusting your search or filters.' : 'Get started by creating your first task.'}
              action={
                hasFilters ? (
                  <button
                    type="button"
                    className={buttonClass('secondary')}
                    onClick={() => {
                      setSearchInput('')
                      setSearchParams({}, { replace: true })
                    }}
                  >
                    Clear filters
                  </button>
                ) : (
                  <Link to="/tasks/new" className={buttonClass('primary')}>
                    <PlusIcon className="size-4" /> New task
                  </Link>
                )
              }
            />
          ) : (
            <div className={loading ? 'opacity-60 transition-opacity' : ''}>
              {/* Table on larger screens */}
              <table className="hidden w-full text-left text-sm md:table">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium tracking-wide text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3">Task</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Due date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks?.map((task) => (
                    <tr key={task.id} className="cursor-pointer transition-colors hover:bg-slate-50" onClick={() => navigate(`/tasks/${task.id}`)}>
                      <td className="max-w-md px-5 py-3.5">
                        <Link to={`/tasks/${task.id}`} className="font-medium text-slate-900 hover:text-indigo-600" onClick={(e) => e.stopPropagation()}>
                          {task.title}
                        </Link>
                        {task.description && <p className="mt-0.5 truncate text-xs text-slate-500">{task.description}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className={`px-5 py-3.5 whitespace-nowrap ${isOverdue(task.dueDate, task.status) ? 'font-medium text-red-600' : 'text-slate-600'}`}>
                        {formatDate(task.dueDate)}
                        {isOverdue(task.dueDate, task.status) && <span className="ml-1 text-xs">(overdue)</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Cards on small screens */}
              <ul className="divide-y divide-slate-100 md:hidden">
                {tasks?.map((task) => (
                  <li key={task.id}>
                    <Link to={`/tasks/${task.id}`} className="block px-4 py-4 hover:bg-slate-50">
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        <span className={`flex items-center gap-1 text-xs ${isOverdue(task.dueDate, task.status) ? 'font-medium text-red-600' : 'text-slate-500'}`}>
                          <CalendarIcon className="size-3.5" />
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {tasks && tasks.length > 0 && (
        <p className="mt-3 text-xs text-slate-500">
          Showing {tasks.length} task{tasks.length === 1 ? '' : 's'}
        </p>
      )}
    </>
  )
}
