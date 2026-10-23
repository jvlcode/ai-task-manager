import { useEffect, type ReactNode } from 'react'
import { PRIORITY_LABELS, PRIORITY_STYLES, STATUS_LABELS, STATUS_STYLES } from '../lib/format'
import { buttonClass } from '../lib/styles'
import type { TaskPriority, TaskStatus } from '../types'
import { AlertIcon } from './icons'

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status].badge}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const styles = PRIORITY_STYLES[priority]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles.badge}`}>
      <span className={`size-1.5 rounded-full ${styles.dot}`} />
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

export function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500" role="status">
      <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
      {label}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-red-50 text-red-600">
        <AlertIcon className="size-6" />
      </div>
      <p className="font-medium text-slate-900">Couldn't load data</p>
      <p className="max-w-md text-sm text-slate-500">{message}</p>
      {onRetry && (
        <button type="button" className={buttonClass('secondary')} onClick={onRetry}>
          Try again
        </button>
      )}
    </Card>
  )
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

export function Alert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200" role="alert">
      <AlertIcon className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  title: string
  message: ReactNode
  confirmLabel?: string
  busy?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{message}</p>
        {error && <Alert message={error} />}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className={buttonClass('secondary')} onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className={buttonClass('danger')} onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
