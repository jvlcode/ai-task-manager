export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600 shadow-sm',
  secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 shadow-sm',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

export function buttonClass(variant: ButtonVariant = 'primary'): string {
  return `inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${BUTTON_STYLES[variant]}`
}

export const inputClass =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600'
