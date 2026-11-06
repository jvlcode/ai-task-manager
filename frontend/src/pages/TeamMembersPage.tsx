import { useState, type FormEvent } from 'react'
import { teamMembersApi } from '../api'
import { ApiError, errorMessage } from '../api/client'
import { MailIcon, PencilIcon, PlusIcon, TrashIcon } from '../components/icons'
import {
  Alert,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  Modal,
  PageHeader,
  Spinner,
} from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { avatarColor, initials } from '../lib/format'
import { buttonClass, inputClass } from '../lib/styles'
import type { TeamMember, TeamMemberInput } from '../types'

type FieldErrors = Partial<Record<keyof TeamMemberInput, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: TeamMemberInput): FieldErrors {
  const errors: FieldErrors = {}
  const name = values.fullName.trim()
  if (!name) errors.fullName = 'Full name is required'
  else if (name.length < 2 || name.length > 100) errors.fullName = 'Full name must be between 2 and 100 characters'
  if (!values.email.trim()) errors.email = 'Email is required'
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Email must be a valid email address'
  if (!values.role.trim()) errors.role = 'Role is required'
  return errors
}

function MemberFormModal({
  member,
  onClose,
  onSaved,
}: {
  member: TeamMember | null
  onClose: () => void
  onSaved: (saved: TeamMember) => void
}) {
  const [values, setValues] = useState<TeamMemberInput>({
    fullName: member?.fullName ?? '',
    email: member?.email ?? '',
    role: member?.role ?? '',
    department: member?.department ?? '',
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = (key: keyof TeamMemberInput, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const clientErrors = validate(values)
    setErrors(clientErrors)
    setFormError(null)
    if (Object.keys(clientErrors).length > 0) return

    const payload: TeamMemberInput = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      role: values.role.trim(),
      department: values.department?.trim() || null,
    }
    setSaving(true)
    try {
      onSaved(member ? await teamMembersApi.update(member.id, payload) : await teamMembersApi.create(payload))
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) {
        setErrors(err.fieldErrors as FieldErrors)
      }
      setFormError(errorMessage(err))
      setSaving(false)
    }
  }

  return (
    <Modal title={member ? 'Edit team member' : 'Add team member'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && <Alert message={formError} />}
        <Field label="Full name" htmlFor="fullName" error={errors.fullName} required>
          <input id="fullName" className={inputClass} value={values.fullName} maxLength={100} onChange={(e) => set('fullName', e.target.value)} autoFocus />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email} required>
          <input id="email" type="email" className={inputClass} value={values.email} maxLength={150} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Role" htmlFor="role" error={errors.role} required>
            <input id="role" className={inputClass} value={values.role} maxLength={100} placeholder="e.g. Frontend Engineer" onChange={(e) => set('role', e.target.value)} />
          </Field>
          <Field label="Department" htmlFor="department" error={errors.department}>
            <input id="department" className={inputClass} value={values.department ?? ''} maxLength={100} placeholder="e.g. Engineering" onChange={(e) => set('department', e.target.value)} />
          </Field>
        </div>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className={buttonClass('secondary')} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className={buttonClass('primary')} disabled={saving}>
            {saving ? 'Saving…' : member ? 'Save changes' : 'Add member'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function TeamMembersPage() {
  const { data: members, error, loading, reload, setData } = useAsync(() => teamMembersApi.list(), 'team-members')

  // `undefined` = closed, `null` = adding a new member, otherwise editing that member.
  const [editing, setEditing] = useState<TeamMember | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<TeamMember | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const sortByName = (list: TeamMember[]) => [...list].sort((a, b) => a.fullName.localeCompare(b.fullName))

  const handleSaved = (saved: TeamMember) => {
    const others = (members ?? []).filter((m) => m.id !== saved.id)
    setData(sortByName([...others, saved]))
    setEditing(undefined)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await teamMembersApi.remove(deleting.id)
      setData((members ?? []).filter((m) => m.id !== deleting.id))
      setDeleting(null)
    } catch (err) {
      setDeleteError(errorMessage(err))
    } finally {
      setDeleteBusy(false)
    }
  }

  const departments = new Set((members ?? []).map((m) => m.department).filter(Boolean))

  return (
    <>
      <PageHeader
        title="Team Members"
        description={
          members ? `${members.length} member${members.length === 1 ? '' : 's'} across ${departments.size} department${departments.size === 1 ? '' : 's'}` : 'The people on your team.'
        }
        actions={
          <button type="button" className={buttonClass('primary')} onClick={() => setEditing(null)}>
            <PlusIcon className="size-4" /> Add member
          </button>
        }
      />

      {loading && !members && <Spinner label="Loading team members…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {members && members.length === 0 && (
        <Card>
          <EmptyState
            title="No team members yet"
            description="Add the people who work on your projects."
            action={
              <button type="button" className={buttonClass('primary')} onClick={() => setEditing(null)}>
                <PlusIcon className="size-4" /> Add member
              </button>
            }
          />
        </Card>
      )}

      {members && members.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <li key={member.id}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start gap-4">
                  <div className={`grid size-12 shrink-0 place-items-center rounded-full text-base font-semibold ${avatarColor(member.email)}`}>
                    {initials(member.fullName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{member.fullName}</p>
                    <p className="truncate text-sm text-slate-600">{member.role}</p>
                    {member.department && (
                      <span className="mt-2 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{member.department}</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <a href={`mailto:${member.email}`} className="flex min-w-0 items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600">
                    <MailIcon className="size-4 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </a>
                  <div className="flex shrink-0">
                    <button type="button" className={`${buttonClass('ghost')} px-2`} onClick={() => setEditing(member)} aria-label={`Edit ${member.fullName}`}>
                      <PencilIcon className="size-4" />
                    </button>
                    <button type="button" className={`${buttonClass('ghost')} px-2 hover:text-red-600`} onClick={() => setDeleting(member)} aria-label={`Delete ${member.fullName}`}>
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {editing !== undefined && <MemberFormModal member={editing} onClose={() => setEditing(undefined)} onSaved={handleSaved} />}

      {deleting && (
        <ConfirmDialog
          title="Remove team member"
          message={
            <>
              Remove <strong className="text-slate-900">{deleting.fullName}</strong> from the team? Tasks assigned to them will
              become unassigned. This cannot be undone.
            </>
          }
          confirmLabel="Remove"
          busy={deleteBusy}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleting(null)
            setDeleteError(null)
          }}
        />
      )}
    </>
  )
}
