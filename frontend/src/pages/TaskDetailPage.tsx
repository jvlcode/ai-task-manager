import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { tasksApi } from '../api'
import { errorMessage } from '../api/client'
import { ArrowLeftIcon, CalendarIcon, PencilIcon, TrashIcon } from '../components/icons'
import { Alert, Card, ConfirmDialog, ErrorState, PriorityBadge, Spinner, StatusBadge } from '../components/ui'
import { buttonClass, inputClass } from '../lib/styles'
import { useAsync } from '../hooks/useAsync'
import { STATUS_LABELS, formatDate, formatDateTime, isOverdue, relativeDueDate } from '../lib/format'
import { TASK_STATUSES, type TaskStatus } from '../types'

function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0">{children}</dd>
    </div>
  )
}

export default function TaskDetailPage() {
  const { id } = useParams()
  const taskId = Number(id)
  const navigate = useNavigate()
  const { data: task, error, loading, reload, setData } = useAsync(() => tasksApi.get(taskId), `task-${taskId}`)

  const [statusSaving, setStatusSaving] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const changeStatus = async (status: TaskStatus) => {
    setStatusSaving(true)
    setStatusError(null)
    try {
      setData(await tasksApi.updateStatus(taskId, status))
    } catch (err) {
      setStatusError(errorMessage(err))
    } finally {
      setStatusSaving(false)
    }
  }

  const deleteTask = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await tasksApi.remove(taskId)
      navigate('/tasks', { replace: true })
    } catch (err) {
      setDeleteError(errorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <>
      <Link to="/tasks" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeftIcon className="size-4" /> Back to tasks
      </Link>

      {loading && !task && <Spinner label="Loading task…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {task && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap gap-2">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight break-words text-slate-900">{task.title}</h1>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link to={`/tasks/${task.id}/edit`} className={buttonClass('secondary')}>
                  <PencilIcon className="size-4" /> Edit
                </Link>
                <button type="button" className={buttonClass('secondary')} onClick={() => setConfirmOpen(true)}>
                  <TrashIcon className="size-4 text-red-600" />
                  <span className="text-red-600">Delete</span>
                </button>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">Description</h2>
              {task.description ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{task.description}</p>
              ) : (
                <p className="text-sm text-slate-400 italic">No description provided.</p>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-5">
              <label htmlFor="quick-status" className="mb-2 block text-sm font-semibold text-slate-900">
                Update status
              </label>
              <select
                id="quick-status"
                className={inputClass}
                value={task.status}
                disabled={statusSaving}
                onChange={(e) => changeStatus(e.target.value as TaskStatus)}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              {statusSaving && <p className="mt-2 text-xs text-slate-500">Saving…</p>}
              {statusError && (
                <div className="mt-3">
                  <Alert message={statusError} />
                </div>
              )}
            </Card>

            <Card className="px-5 py-2">
              <dl className="divide-y divide-slate-100">
                <DetailItem label="Due date">
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="size-4 text-slate-400" />
                    {formatDate(task.dueDate)}
                  </span>
                  {task.dueDate && (
                    <span className={`mt-0.5 block text-xs ${isOverdue(task.dueDate, task.status) ? 'font-medium text-red-600' : 'text-slate-500'}`}>
                      {task.status === 'DONE' ? 'Completed' : relativeDueDate(task.dueDate)}
                    </span>
                  )}
                </DetailItem>
                <DetailItem label="Created">{formatDateTime(task.createdAt)}</DetailItem>
                <DetailItem label="Last updated">{formatDateTime(task.updatedAt)}</DetailItem>
                <DetailItem label="Task ID">#{task.id}</DetailItem>
              </dl>
            </Card>
          </div>
        </div>
      )}

      {confirmOpen && task && (
        <ConfirmDialog
          title="Delete task"
          message={
            <>
              Are you sure you want to delete <strong className="text-slate-900">{task.title}</strong>? This cannot be undone.
            </>
          }
          busy={deleting}
          error={deleteError}
          onConfirm={deleteTask}
          onCancel={() => {
            setConfirmOpen(false)
            setDeleteError(null)
          }}
        />
      )}
    </>
  )
}
