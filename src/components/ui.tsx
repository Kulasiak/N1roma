/** Primitivi di interfaccia condivisi. */

import {
  useEffect, useId, useRef,
  type ButtonHTMLAttributes, type CSSProperties, type InputHTMLAttributes,
  type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------- Button */

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger' | 'subtle'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-on-brand hover:brightness-110 shadow-[0_8px_24px_-10px_var(--brand)]',
  accent: 'bg-grad-brand text-white hover:brightness-110 shadow-[var(--glow)]',
  secondary: 'bg-surface text-text border border-line hover:border-line-strong hover:bg-surface-2',
  subtle: 'bg-surface-2 text-soft hover:bg-brand-soft hover:text-text',
  ghost: 'text-soft hover:bg-surface-2 hover:text-text',
  danger: 'bg-bad text-white hover:brightness-110',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[15px] gap-2.5 rounded-xl',
  icon: 'h-9 w-9 rounded-lg justify-center',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'secondary', size = 'md', className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap',
        'transition-all duration-200 active:scale-[0.97]',
        'disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant], SIZES[size], className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

/* --------------------------------------------------------------- Card */

export function Card({
  className, children, style, as: Tag = 'div',
}: {
  className?: string
  children: ReactNode
  style?: CSSProperties
  as?: 'div' | 'section' | 'article' | 'li'
}) {
  return <Tag className={cn('surface-card', className)} style={style}>{children}</Tag>
}

export function CardHeader({
  title, subtitle, action, className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 p-5 pb-0', className)}>
      <div className="min-w-0">
        <h3 className="text-lg leading-tight font-semibold">{title}</h3>
        {subtitle && <p className="text-mute mt-1 text-[13px]">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/* -------------------------------------------------------------- Badge */

type Tone = 'neutral' | 'brand' | 'accent' | 'good' | 'warn' | 'bad' | 'mute'

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-soft border-line',
  brand: 'bg-brand-soft text-brand border-brand/30',
  accent: 'text-accent border-accent/35 bg-accent/12',
  good: 'text-good border-good/35 bg-good/12',
  warn: 'text-warn border-warn/35 bg-warn/12',
  bad: 'text-bad border-bad/35 bg-bad/12',
  mute: 'bg-surface-2 text-mute border-line',
}

export function Badge({
  tone = 'neutral', className, children,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide',
      TONES[tone], className,
    )}>
      {children}
    </span>
  )
}

/* ------------------------------------------------------------- Avatar */

export function Avatar({
  name, color, size = 'md', className,
}: {
  name: string
  color?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const letters = name.split(' ').slice(0, 2).map((w) => w.charAt(0)).join('').toUpperCase()
  const sizes = {
    xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-xs',
    lg: 'h-14 w-14 text-base', xl: 'h-20 w-20 text-2xl',
  }
  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-full font-bold text-white',
        'ring-2 ring-white/70 dark:ring-white/10', sizes[size],
        !color && 'bg-grad-brand', className,
      )}
      style={color ? { background: `linear-gradient(140deg, ${color}, ${color}bb)` } : undefined}
      aria-hidden="true"
    >
      {letters}
    </span>
  )
}

/* ------------------------------------------------------------- Fields */

const FIELD =
  'w-full rounded-xl border border-line bg-surface px-3.5 text-sm text-text transition-colors ' +
  'placeholder:text-mute hover:border-line-strong focus:border-brand focus:outline-none ' +
  'focus:ring-4 focus:ring-[color-mix(in_srgb,var(--brand)_18%,transparent)] disabled:opacity-50'

export function Field({
  label, hint, children, className,
}: {
  label?: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      {label && <span className="text-soft mb-1.5 block text-[12px] font-semibold tracking-wide">{label}</span>}
      {children}
      {hint && <span className="text-mute mt-1.5 block text-[11px]">{hint}</span>}
    </label>
  )
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD, 'h-10', className)} {...rest} />
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD, 'min-h-24 resize-y py-2.5', className)} {...rest} />
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(FIELD, 'h-10 cursor-pointer appearance-none pr-9', className)} {...rest}>
      {children}
    </select>
  )
}

/* ------------------------------------------------------------- Switch */

export function Switch({
  checked, onChange, label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
}) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300',
        checked ? 'bg-brand' : 'bg-line-strong',
      )}
    >
      <span className={cn(
        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300',
        checked && 'translate-x-5',
      )} />
    </button>
  )
}

/* ---------------------------------------------------------- Segmented */

export function Segmented<T extends string>({
  options, value, onChange, className,
}: {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div className={cn('bg-surface-2 border-line inline-flex gap-0.5 rounded-xl border p-1', className)}>
      {options.map((opt) => (
        <button
          key={opt.value} type="button" onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-all duration-200',
            value === opt.value ? 'bg-surface text-text shadow-sm' : 'text-mute hover:text-text',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- Modal */

export function Modal({
  open, onClose, title, subtitle, children, footer, size = 'md',
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }

  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6"
      role="dialog" aria-modal="true" aria-labelledby={titleId}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[3px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef} tabIndex={-1}
        className={cn(
          'animate-pop bg-surface border-line relative my-auto w-full border shadow-[var(--shadow-lift)] outline-none',
          'rounded-t-3xl sm:rounded-3xl', widths[size],
        )}
      >
        <div className="border-line flex items-start justify-between gap-4 border-b p-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl leading-tight font-semibold">{title}</h2>
            {subtitle && <p className="text-mute mt-1 text-[13px]">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="×">
            <X className="h-4.5 w-4.5" />
          </Button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="border-line bg-surface-2/60 flex flex-wrap items-center justify-end gap-2 rounded-b-3xl border-t p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/* --------------------------------------------------------- EmptyState */

export function EmptyState({
  icon, title, description, action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && (
        <div className="bg-surface-2 text-brand mb-4 grid h-14 w-14 place-items-center rounded-2xl">
          {icon}
        </div>
      )}
      <p className="font-display text-lg font-semibold">{title}</p>
      {description && <p className="text-mute mt-1.5 max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ----------------------------------------------------------- Progress */

export function Progress({
  value, className, color,
}: {
  value: number
  className?: string
  color?: string
}) {
  return (
    <div className={cn('bg-surface-2 h-2 w-full overflow-hidden rounded-full', className)}>
      <div
        className={cn('h-full rounded-full transition-[width] duration-700', !color && 'bg-grad-brand')}
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </div>
  )
}

/* -------------------------------------------------------- SearchInput */

export function SearchInput({
  value, onChange, placeholder, icon, className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      {icon && <span className="text-mute pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">{icon}</span>}
      <Input
        type="search" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className={icon ? 'pl-9' : undefined}
      />
    </div>
  )
}
