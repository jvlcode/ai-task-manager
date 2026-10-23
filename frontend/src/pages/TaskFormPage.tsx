import { Link, useNavigate, useParams } from 'react-router-dom'
import { tasksApi } from '../api'
import { ArrowLeftIcon } from '../components/icons'
import TaskForm from '../components/TaskForm'
import { Card, ErrorState, PageHeader, Spinner } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import type { TaskInput } from '../types'

/** Handles both /tasks/new and /tasks/:id/edit. */
export default function TaskFormPage() {
  const { id } = useParams()
  const isEdit = id !== undefined
  const taskId = Number(id)
  const navigate = useNavigate()

  const { data: task, error, loading, reload } = useAsync(
    () => (isEdit ? tasksApi.get(taskId) : Promise.resolve(undefined)),
    `task-form-${id ?? 'new'}`,
  )

  const backTo = isEdit ? `/tasks/${taskId}` : '/tasks'

  const handleSubmit = async (values: TaskInput) => {
    const saved = isEdit ? await tasksApi.update(taskId, values) : await tasksApi.create(values)
    navigate(`/tasks/${saved.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={backTo} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeftIcon className="size-4" /> {isEdit ? 'Back to task' : 'Back to tasks'}
      </Link>

      <PageHeader
        title={isEdit ? 'Edit task' : 'New task'}
        description={isEdit ? 'Update the details of this task.' : 'Fill in the details to create a new task.'}
      />

      {isEdit && loading && <Spinner label="Loading task…" />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {(!isEdit || task) && (
        <Card className="p-6">
          <TaskForm
            initialValues={
              task && {
                title: task.title,
                description: task.description ?? '',
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
              }
            }
            submitLabel={isEdit ? 'Save changes' : 'Create task'}
            onSubmit={handleSubmit}
            onCancel={() => navigate(backTo)}
          />
        </Card>
      )}
    </div>
  )
}
