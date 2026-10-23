import { Link } from 'react-router-dom'
import { buttonClass } from '../lib/styles'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className={`${buttonClass('primary')} mt-6`}>
        Go to dashboard
      </Link>
    </div>
  )
}
