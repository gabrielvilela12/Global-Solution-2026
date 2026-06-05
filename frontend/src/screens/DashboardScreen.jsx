import { useEffect, useState } from 'react'
import { getSolicitacoes } from '../api/client.js'
import { TopBar, Kicker, SectionTitle, StatusPill, Btn, fmtData, fmtId } from '../components/ui.jsx'

export default function DashboardScreen({ onNav, flash }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getSolicitacoes()
      .then(data => setRows([...data].sort((a, b) => b.id - a.id)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [flash])

  const n = (st) => rows.filter(r => r.status === st).length
  const stats = [
    ['Em análise', n('analise')],
    ['Aprovados', n('aprovado')],
    ['Em órbita / agendado', n('agendado')],
    ['Concluídos', n('concluido')],
  ]

  return (
    <div className="min-h-screen bg-bg">
      <TopBar active="dashboard" onNav={onNav} />
      <div className="max-w-page mx-auto px-6 py-7">
        <div className="flex items-start justify-between mb-6">
          <div>
            <Kicker>Painel da instituição</Kicker>
            <SectionTitle>Meus aluguéis</SectionTitle>
          </div>
          <Btn onClick={() => onNav('home')}>＋ Nova solicitação</Btn>
        </div>

        {flash && (
          <div className="flex items-center gap-2.5 bg-panel border border-line rounded-[12px] px-4 py-3 mb-6 text-[13.5px] text-muted">
            <span className="text-done">✓</span>
            Solicitação <strong className="font-mono text-text">{fmtId(flash.id)}</strong> enviada — aguardando análise da operadora.
          </div>
        )}

        {/* stat tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
          {stats.map(([k, v]) => (
            <div key={k} className="bg-panel border border-line rounded-[12px] p-5">
              <span className="font-display font-bold text-[34px] tracking-tight text-text leading-none block mb-1.5">{v}</span>
              <span className="text-[12px] text-dim">{k}</span>
            </div>
          ))}
        </div>

        {/* tabela */}
        <div className="bg-panel border border-line rounded-[14px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-line">
            <div className="flex gap-1">
              <span className="px-3 py-1 rounded-[6px] text-[13px] font-medium text-accent bg-accent/10">Todos</span>
              <span className="px-3 py-1 rounded-[6px] text-[13px] font-medium text-muted cursor-pointer">Em andamento</span>
              <span className="px-3 py-1 rounded-[6px] text-[13px] font-medium text-muted cursor-pointer">Concluídos</span>
            </div>
            <span className="text-[12px] text-dim">Ordenar: mais recentes ▾</span>
          </div>

          {loading && <p className="text-muted text-sm p-5">Carregando…</p>}
          {error && <p className="text-stop text-sm p-5">Erro: {error}. Verifique se o backend está rodando em localhost:8080.</p>}

          {!loading && !error && (
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="bg-bg2 border-b border-line">
                  {['Pedido', 'Satélite', 'Objetivo da missão', 'Início', 'Duração', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-dim font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const isNew = flash && r.id === flash.id
                  return (
                    <tr key={r.id} className={`border-b border-line last:border-0 hover:bg-panel2 transition ${isNew ? 'bg-accent/[0.05]' : ''}`}>
                      <td className="px-4 py-3.5 font-mono text-[12px] text-muted whitespace-nowrap">{fmtId(r.id)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-accent/15 border border-accent/50 text-accent flex items-center justify-center text-[8px] shrink-0">◍</span>
                          <div>
                            <div className="font-semibold text-text leading-tight">{r.satelite?.nome}</div>
                            <div className="text-[11.5px] text-dim">{r.satelite?.operadora}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted max-w-[220px] truncate">{r.objetivo}</td>
                      <td className="px-4 py-3.5 font-mono text-[12px] text-muted whitespace-nowrap">{fmtData(r.dataInicio)}</td>
                      <td className="px-4 py-3.5 text-muted whitespace-nowrap">{r.duracao || '—'}</td>
                      <td className="px-4 py-3.5"><StatusPill status={r.status} /></td>
                      <td className="px-4 py-3.5">
                        <button className="border border-line rounded-[6px] px-2 py-1 text-dim hover:text-text hover:border-line2 transition">⋯</button>
                      </td>
                    </tr>
                  )
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-dim text-sm">Nenhuma solicitação ainda. Crie uma pelo catálogo.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
