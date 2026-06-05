import { useEffect, useState } from 'react'
import { getSatelites } from '../api/client.js'
import { TopBar, Kicker, Ph, Chip, Btn } from '../components/ui.jsx'

export default function HomeScreen({ onNav, onOpen }) {
  const [sats, setSats] = useState([])
  const [filter, setFilter] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getSatelites()
      .then(setSats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const cats = ['Todos', 'Clima', 'Comunicação', 'Topografia']
  const count = (c) => c === 'Todos' ? sats.length : sats.filter(s => s.categoria === c).length
  const listed = filter === 'Todos' ? sats : sats.filter(s => s.categoria === filter)

  return (
    <div className="min-h-screen bg-bg">
      <TopBar active="home" onNav={onNav} />

      {/* hero de busca */}
      <div className="border-b border-line" style={{ background: 'linear-gradient(180deg,#0d1a31 0%, transparent 100%)' }}>
        <div className="max-w-page mx-auto px-6 py-8">
          <Kicker>Catálogo · {sats.length} satélites disponíveis</Kicker>
          <h1 className="font-display font-bold text-[24px] tracking-tight text-text mb-4">Encontre tempo orbital sob demanda</h1>
          <div className="flex items-center gap-3 bg-panel2 border border-line rounded-[12px] px-4 py-3 hover:border-accent/30 transition">
            <span className="text-dim text-lg">⌕</span>
            <span className="flex-1 text-dim text-sm">Buscar por satélite, operadora, sensor ou região…</span>
            <Btn sm>Buscar</Btn>
          </div>
        </div>
      </div>

      <div className="max-w-page mx-auto px-6 py-7">
        {/* filtros */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <span className="font-mono text-[11px] uppercase tracking-wider text-dim">Filtrar por capacidade</span>
          {cats.map(c => (
            <Chip key={c} active={filter === c} onClick={() => setFilter(c)} count={count(c)}>{c}</Chip>
          ))}
          <div className="ml-auto flex items-center gap-4 text-[12.5px] text-dim">
            <span className="hover:text-muted cursor-pointer">Órbita ▾</span>
            <span className="hover:text-muted cursor-pointer">Resolução ▾</span>
            <span className="hover:text-muted cursor-pointer">Preço ▾</span>
            <span className="text-accent cursor-pointer">Limpar</span>
          </div>
        </div>

        {loading && <p className="text-muted text-sm">Carregando satélites…</p>}
        {error && <p className="text-stop text-sm">Erro: {error}. Verifique se o backend está rodando em localhost:8080.</p>}

        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listed.map(s => (
            <button key={s.id} onClick={() => onOpen(s)} type="button"
              className="text-left bg-panel border border-line rounded-[14px] overflow-hidden hover:border-line2 hover:-translate-y-0.5 transition-all">
              <div className="relative">
                <Ph label="[ IMG · satélite ]" className="h-[148px] rounded-none border-x-0 border-t-0" />
                <span className="absolute top-3 left-3 bg-bg/85 backdrop-blur border border-line rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                  {s.categoria}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-[16px] text-text mb-1.5">{s.nome}</h3>
                <div className="flex items-center gap-1.5 text-[12px] text-muted mb-2">
                  <span className="w-4 h-4 rounded-full bg-accent/15 border border-accent/50 text-accent flex items-center justify-center text-[7px]">◍</span>
                  {s.operadora}
                </div>
                <div className="font-mono text-[11.5px] text-dim mb-3">
                  {s.orbita?.split(' · ')[0]} · {s.resolucao !== '—' ? s.resolucao : s.capacidade?.split(' · ')[0]}
                </div>
                <div className="flex items-baseline justify-between pt-3 border-t border-line">
                  <span className="font-display font-bold text-[17px] text-text">
                    {s.preco}<span className="font-sans font-normal text-[11px] text-dim ml-1">{s.unidade}</span>
                  </span>
                  <span className="text-[12.5px] text-accent font-semibold">Ver detalhes →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
