import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import TaskDetailPage from './pages/TaskDetailPage'
import TaskFormPage from './pages/TaskFormPage'
import TasksPage from './pages/TasksPage'
import TeamMembersPage from './pages/TeamMembersPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/new" element={<TaskFormPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="tasks/:id/edit" element={<TaskFormPage />} />
        <Route path="team" element={<TeamMembersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
