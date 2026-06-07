import { useState, useRef, useEffect } from 'react'
import { fmtData } from './ui.jsx'

const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MESES_NOME = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

// Helpers de data — trabalham com 'YYYY-MM-DD' (string ISO, sem fuso)
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
const sameDay = (a, b) => a && b && iso(a) === iso(b)
const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export function Calendar({ value, onChange, minDate }) {
  const min = stripTime(minDate || new Date())
  const inicio = value?.inicio ? fromIso(value.inicio) : null
  const fim = value?.fim ? fromIso(value.fim) : null
  const [mes, setMes] = useState(stripTime(inicio || min))
  const [hover, setHover] = useState(null)

  const ano = mes.getFullYear(), mesIdx = mes.getMonth()
  const primeiroDiaSemana = new Date(ano, mesIdx, 1).getDay()
  const totalDias = new Date(ano, mesIdx + 1, 0).getDate()
  const celulas = []
  for (let i = 0; i < primeiroDiaSemana; i++) celulas.push(null)
  for (let d = 1; d <= totalDias; d++) celulas.push(new Date(ano, mesIdx, d))

  const noRange = (d) => {
    if (!inicio) return false
    const fimEfetivo = fim || hover
    if (!fimEfetivo) return false
    const a = inicio < fimEfetivo ? inicio : fimEfetivo
    const b = inicio < fimEfetivo ? fimEfetivo : inicio
    return d > a && d < b
  }

  const clicar = (d) => {
    if (d < min) return
    if (!inicio || (inicio && fim)) {
      onChange({ inicio: iso(d), fim: null })
    } else {
      if (d < inicio) onChange({ inicio: iso(d), fim: null })
      else onChange({ inicio: value.inicio, fim: iso(d) })
    }
  }

  return (
    <div className="bg-panel border border-line2 rounded-[12px] p-4 w-[300px] shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => setMes(new Date(ano, mesIdx - 1, 1))}
          className="w-7 h-7 rounded-[7px] border border-line text-muted hover:border-accent hover:text-accent transition flex items-center justify-center">◀</button>
        <span className="font-display font-semibold text-[14px] text-text">{MESES_NOME[mesIdx]} {ano}</span>
        <button type="button" onClick={() => setMes(new Date(ano, mesIdx + 1, 1))}
          className="w-7 h-7 rounded-[7px] border border-line text-muted hover:border-accent hover:text-accent transition flex items-center justify-center">▶</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DIAS.map((d, i) => <span key={i} className="text-center font-mono text-[10px] text-dim py-1">{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1" onMouseLeave={() => setHover(null)}>
        {celulas.map((d, i) => {
          if (!d) return <span key={i} />
          const disabled = d < min
          const selecionado = sameDay(d, inicio) || sameDay(d, fim)
          const dentro = noRange(d)
          const hoje = sameDay(d, min)
          let cls = 'h-9 rounded-[7px] text-[13px] flex items-center justify-center transition '
          if (disabled) cls += 'text-dim/40 cursor-not-allowed'
          else if (selecionado) cls += 'bg-accent text-ink font-semibold'
          else if (dentro) cls += 'bg-accent/15 text-text'
          else cls += 'text-text hover:bg-panel2 cursor-pointer' + (hoje ? ' ring-1 ring-line2' : '')
          return (
            <button key={i} type="button" disabled={disabled}
              onMouseEnter={() => !disabled && setHover(d)}
              onClick={() => clicar(d)} className={cls}>
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DateRangeField({ label, value, onChange, required, hint }) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const fora = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    const esc = (e) => { if (e.key === 'Escape') setAberto(false) }
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', fora); document.removeEventListener('keydown', esc) }
  }, [aberto])

  const texto = value?.inicio
    ? (value.fim ? `${fmtData(value.inicio)} – ${fmtData(value.fim)}` : `${fmtData(value.inicio)} – …`)
    : 'Selecione o período'

  const handleChange = (range) => {
    onChange(range)
    if (range.inicio && range.fim) setAberto(false)
  }

  return (
    <label className="flex flex-col gap-1.5 relative" ref={ref}>
      <span className="text-[13px] font-medium text-muted">
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </span>
      <button type="button" onClick={() => setAberto(a => !a)}
        className="h-10 bg-bg2 border border-line2 rounded-[9px] px-3 text-[14px] text-left flex items-center justify-between focus:border-accent outline-none transition">
        <span className={value?.inicio ? 'text-text' : 'text-dim'}>{texto}</span>
        <span className="text-dim text-sm">▾</span>
      </button>
      {aberto && (
        <div className="absolute z-50 top-full left-0 mt-1">
          <Calendar value={value} onChange={handleChange} />
        </div>
      )}
      {hint && <span className="text-[11.5px] text-dim">{hint}</span>}
    </label>
  )
}
