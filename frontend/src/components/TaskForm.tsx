import { useState, type FormEvent } from 'react'
import { ApiError, errorMessage } from '../api/client'
import { PRIORITY_LABELS, STATUS_LABELS } from '../lib/format'
import { TASK_PRIORITIES, TASK_STATUSES, type TaskInput } from '../types'
import { Alert, Field } from './ui'
import { buttonClass, inputClass } from '../lib/styles'

type FieldErrors = Partial<Record<keyof TaskInput, string>>

const EMPTY_TASK: TaskInput = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: null,
}

/** Mirrors the backend constraints so most mistakes are caught before a round trip. */
function validate(values: TaskInput): FieldErrors {
  const errors: FieldErrors = {}
  const title = values.title.trim()
  if (!title) errors.title = 'Title is required'
  else if (title.length < 3 || title.length > 150) errors.title = 'Title must be between 3 and 150 characters'
  if ((values.description ?? '').length > 2000) errors.description = 'Description must be at most 2000 characters'
  return errors
}

export default function TaskForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialValues?: TaskInput
  submitLabel: string
  onSubmit: (values: TaskInput) => Promise<void>
  onCancel: () => void
}) {
  const [values, setValues] = useState<TaskInput>(initialValues ?? EMPTY_TASK)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const clientErrors = validate(values)
    setErrors(clientErrors)
    setFormError(null)
    if (Object.keys(clientErrors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        description: values.description?.trim() || null,
        dueDate: values.dueDate || null,
      })
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors as FieldErrors)
      }
      setFormError(errorMessage(err))
      setSubmitting(false)
    }
  }

  const descriptionLength = (values.description ?? '').length

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && <Alert message={formError} />}

      <Field label="Title" htmlFor="title" error={errors.title} required>
        <input
          id="title"
          className={inputClass}
          value={values.title}
          maxLength={150}
          placeholder="e.g. Prepare release notes"
          onChange={(e) => set('title', e.target.value)}
          autoFocus
        />
      </Field>

      <Field label="Description" htmlFor="description" error={errors.description}>
        <textarea
          id="description"
          className={`${inputClass} min-h-32`}
          value={values.description ?? ''}
          maxLength={2000}
          placeholder="Add more context, acceptance criteria or links…"
          onChange={(e) => set('description', e.target.value)}
        />
        <p className="mt-1 text-right text-xs text-slate-400">{descriptionLength}/2000</p>
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Status" htmlFor="status" error={errors.status} required>
          <select id="status" className={inputClass} value={values.status} onChange={(e) => set('status', e.target.value as TaskInput['status'])}>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Priority" htmlFor="priority" error={errors.priority} required>
          <select id="priority" className={inputClass} value={values.priority} onChange={(e) => set('priority', e.target.value as TaskInput['priority'])}>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Due date" htmlFor="dueDate" error={errors.dueDate}>
          <input
            id="dueDate"
            type="date"
            className={inputClass}
            value={values.dueDate ?? ''}
            onChange={(e) => set('dueDate', e.target.value || null)}
          />
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button type="button" className={buttonClass('secondary')} onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className={buttonClass('primary')} disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
