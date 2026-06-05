/* Primitivas de UI compartilhadas — fiéis ao wireframe ORBITA.market */

import { useState } from 'react'

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
)

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function fmtData(iso) {
  if (!iso) return 'a definir'
  const p = String(iso).split('-')
  if (p.length < 3) return iso
  return `${p[2].slice(0, 2)} ${MESES[(+p[1]) - 1]} ${p[0]}`
}

export function fmtId(id) {
  return `#ORB-${2250 + Number(id)}`
}

export function Brand({ onClick }) {
  return (
    <button onClick={onClick} type="button"
      className="flex items-center gap-2 font-display font-bold text-[17px] tracking-tight text-text">
      <span className="text-accent">◍</span>
      <span>ORBITA<span className="text-muted font-medium">.market</span></span>
    </button>
  )
}

export function Ph({ label, className = '', style }) {
  return (
    <div className={`relative flex items-center justify-center bg-panel border border-line overflow-hidden ${className}`} style={style}>
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 7px, rgba(120,160,230,.045) 7px, rgba(120,160,230,.045) 8px)',
      }} />
      <span className="relative font-mono text-[11px] text-dim text-center px-3">{label}</span>
    </div>
  )
}

export function TopBar({ active, onNav, minimal }) {
  if (minimal) {
    return (
      <header className="border-b border-line px-6">
        <div className="max-w-page mx-auto flex items-center h-[58px]">
          <Brand onClick={() => onNav?.('login')} />
          <span className="ml-auto font-mono text-xs text-dim hidden sm:block">Marketplace de tempo orbital sob demanda</span>
        </div>
      </header>
    )
  }

  const NavItem = ({ children, on, act }) => (
    <button onClick={on} type="button"
      className={`px-3.5 py-1.5 rounded-[7px] text-[13.5px] font-medium transition ${act ? 'text-text bg-accent/10' : 'text-muted hover:text-text'}`}>
      {children}
    </button>
  )

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-line px-6">
      <div className="max-w-page mx-auto flex items-center gap-6 h-[58px]">
        <Brand onClick={() => onNav('home')} />
        <nav className="flex gap-1 flex-1">
          <NavItem on={() => onNav('home')} act={['home', 'details', 'checkout'].includes(active)}>Catálogo</NavItem>
          <NavItem on={() => onNav('dashboard')} act={active === 'dashboard'}>Meus Aluguéis</NavItem>
          <NavItem>Suporte</NavItem>
        </nav>
        <button type="button" className="w-9 h-9 rounded-[7px] border border-line text-muted flex items-center justify-center hover:border-accent hover:text-accent transition">◇</button>
        <button type="button" onClick={() => onNav('login')}
          className="flex items-center gap-2.5 border border-line rounded-[7px] pl-1 pr-3 py-1 hover:border-accent/50 transition">
          <span className="w-7 h-7 rounded-full bg-accent/15 border border-accent/60 text-accent font-mono text-[10px] flex items-center justify-center">UF</span>
          <span className="text-left leading-tight hidden sm:block">
            <span className="block text-xs font-semibold text-text">Univ. Federal</span>
            <span className="block text-[10px] text-dim">Pesquisa</span>
          </span>
        </button>
      </div>
    </header>
  )
}

export function Kicker({ children }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-accent mb-1.5">{children}</p>
}

export function SectionTitle({ children, className = '' }) {
  return <h2 className={`font-display font-bold text-[22px] tracking-tight text-text ${className}`}>{children}</h2>
}

export function Crumbs({ items }) {
  return (
    <nav className="flex items-center gap-2 font-mono text-[12px] text-dim mb-6">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {it.onClick
            ? <button onClick={it.onClick} className="text-muted hover:text-accent transition">{it.label}</button>
            : <span className="text-text">{it.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export function Chip({ children, active, onClick, count }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 h-8 rounded-full text-[13px] font-medium border transition ${active ? 'bg-accent/[0.12] border-accent text-accent' : 'bg-panel border-line text-muted hover:border-accent/40 hover:text-text'}`}>
      {children}
      {count != null && <span className={`font-mono text-[11px] px-1.5 rounded-full ${active ? 'bg-accent/20' : 'bg-bg'}`}>{count}</span>}
    </button>
  )
}

const STATUS = {
  analise:   ['Em análise', 'warn'],
  aprovado:  ['Aprovado', 'ok'],
  agendado:  ['Agendado', 'info'],
  concluido: ['Concluído', 'done'],
  recusado:  ['Recusado', 'stop'],
}
const PILL_CLS = {
  warn: 'text-warn bg-warn/10 border-warn/25',
  ok:   'text-ok bg-ok/10 border-ok/25',
  info: 'text-info bg-info/10 border-info/25',
  done: 'text-done bg-done/10 border-done/25',
  stop: 'text-stop bg-stop/10 border-stop/25',
}
export function StatusPill({ status }) {
  const [label, c] = STATUS[status] || STATUS.analise
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${PILL_CLS[c]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

const FIELD_BASE = 'w-full bg-bg2 border border-line2 rounded-[9px] px-3 text-[14px] text-text placeholder:text-dim focus:border-accent outline-none transition'
const SELECT_BG = {
  backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%23728aae' d='M0 0h10L5 6z'/></svg>\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
}

export function Field({ label, value, placeholder, type = 'text', hint, required, onChange, options }) {
  const [show, setShow] = useState(false)
  let control
  if (type === 'password') {
    control = (
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange?.(e.target.value)}
          className={`${FIELD_BASE} h-10 pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim hover:text-accent transition"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    )
  } else if (type === 'area') {
    control = <textarea rows={4} value={value} placeholder={placeholder} onChange={e => onChange?.(e.target.value)} className={`${FIELD_BASE} py-2.5 resize-none`} />
  } else if (type === 'select') {
    control = (
      <select value={value} onChange={e => onChange?.(e.target.value)} className={`${FIELD_BASE} h-10 appearance-none cursor-pointer pr-9`} style={SELECT_BG}>
        {placeholder && <option value="">{placeholder}</option>}
        {(options || []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  } else if (type === 'date') {
    control = <input type="date" value={value} onChange={e => onChange?.(e.target.value)} className={`${FIELD_BASE} h-10`} />
  } else if (type === 'static') {
    control = (
      <div className={`${FIELD_BASE} h-10 flex items-center justify-between cursor-default`}>
        <span className={value ? 'text-text' : 'text-dim'}>{value || placeholder}</span>
        <span className="text-dim text-xs">▾</span>
      </div>
    )
  } else {
    control = <input type={type} value={value} placeholder={placeholder} onChange={e => onChange?.(e.target.value)} className={`${FIELD_BASE} h-10`} />
  }
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-muted">
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </span>
      {control}
      {hint && <span className="text-[11.5px] text-dim">{hint}</span>}
    </label>
  )
}

export function Btn({ children, variant = 'primary', full, sm, onClick, type = 'button', disabled }) {
  const v = variant === 'primary'
    ? 'bg-accent text-ink hover:bg-[#7aa6f5] font-semibold'
    : 'border border-line2 text-muted hover:border-accent hover:text-accent'
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-[9px] text-[13.5px] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-line2 disabled:hover:text-muted ${v} ${sm ? 'h-8 px-3.5 text-[12.5px]' : 'h-10 px-5'} ${full ? 'w-full' : ''}`}>
      {children}
    </button>
  )
}
