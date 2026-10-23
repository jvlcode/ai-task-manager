import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { DashboardIcon, MenuIcon, TasksIcon, UsersIcon, XIcon } from './icons'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/tasks', label: 'Tasks', icon: TasksIcon, end: false },
  { to: '/team', label: 'Team Members', icon: UsersIcon, end: false },
]

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M6 12.5l4 4L18 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-lg font-semibold tracking-tight">TaskFlow</span>
    </div>
  )
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="mt-8 flex flex-col gap-1">
      {NAV_ITEMS.map(({ to, label, icon: ItemIcon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <ItemIcon className="size-5 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-6 lg:block">
        <Brand />
        <NavItems />
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation"
        >
          <MenuIcon />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white px-4 py-6 shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Close navigation"
              >
                <XIcon />
              </button>
            </div>
            <NavItems onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
