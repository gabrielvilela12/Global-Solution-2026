import { useEffect, useState } from 'react'
import { getSolicitacoes, atualizarStatusSolicitacao } from '../api/client.js'
import { TopBar, Kicker, SectionTitle, StatusPill, fmtData, fmtId } from '../components/ui.jsx'

const ACOES = [
  { label: 'Aprovar', value: 'aprovado' },
  { label: 'Recusar', value: 'recusado' },
  { label: 'Agendar', value: 'agendado' },
  { label: 'Concluir', value: 'concluido' },
]

export default function OperadoraScreen({ onNav, user }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const carregar = () => {
    setLoading(true)
    getSolicitacoes()
      .then(data => setRows([...data].sort((a, b) => b.id - a.id)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(carregar, [])

  const mudarStatus = async (id, status) => {
    if (!status) return
    setError(null)
    try {
      const atualizada = await atualizarStatusSolicitacao(id, status, user?.id)
      setRows(rs => rs.map(r => r.id === id ? { ...r, status: atualizada.status } : r))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <TopBar active="operadora" onNav={onNav} />
      <div className="max-w-page mx-auto px-6 py-7">
        <Kicker>Painel da operadora</Kicker>
        <SectionTitle className="mb-6">Gestão de solicitações</SectionTitle>

        {error && <p className="text-stop text-sm mb-4">{error}</p>}

        <div className="bg-panel border border-line rounded-[14px] overflow-hidden">
          {loading && <p className="text-muted text-sm p-5">Carregando…</p>}
          {!loading && (
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="bg-bg2 border-b border-line">
                  {['Pedido', 'Instituição', 'Satélite', 'Objetivo', 'Janela', 'Status', 'Ação'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-dim font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b border-line last:border-0 hover:bg-panel2 transition">
                    <td className="px-4 py-3.5 font-mono text-[12px] text-muted whitespace-nowrap">{fmtId(r.id)}</td>
                    <td className="px-4 py-3.5 text-text">{r.instituicao || '—'}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-text leading-tight">{r.satelite?.nome}</div>
                      <div className="text-[11.5px] text-dim">{r.satelite?.operadora}</div>
                    </td>
                    <td className="px-4 py-3.5 text-muted max-w-[200px] truncate">{r.objetivo}</td>
                    <td className="px-4 py-3.5 font-mono text-[12px] text-muted whitespace-nowrap">{r.dataFim ? `${fmtData(r.dataInicio)} – ${fmtData(r.dataFim)}` : fmtData(r.dataInicio)}</td>
                    <td className="px-4 py-3.5"><StatusPill status={r.status} /></td>
                    <td className="px-4 py-3.5">
                      <select
                        value=""
                        onChange={e => mudarStatus(r.id, e.target.value)}
                        className="h-8 bg-bg2 border border-line2 rounded-[7px] px-2 text-[12.5px] text-text cursor-pointer focus:border-accent outline-none">
                        <option value="">Alterar…</option>
                        {ACOES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-dim text-sm">Nenhuma solicitação no sistema.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
