import { TopBar, Kicker, SectionTitle, Crumbs, Ph, Btn } from '../components/ui.jsx'

export default function DetailScreen({ sat, onNav, onRequest }) {
  if (!sat) return null
  const specs = [
    ['Capacidade', sat.capacidade],
    ['Órbita', sat.orbita],
    ['Resolução', sat.resolucao],
    ['Revisita', sat.revisita],
    ['Operadora', sat.operadora],
    ['Categoria', sat.categoria],
  ]

  return (
    <div className="min-h-screen bg-bg">
      <TopBar active="details" onNav={onNav} />
      <div className="max-w-page mx-auto px-6 py-7">
        <Crumbs items={[
          { label: 'Catálogo', onClick: () => onNav('home') },
          { label: sat.categoria, onClick: () => onNav('home') },
          { label: sat.nome },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* galeria + specs */}
          <div>
            <Ph label="[ IMG · equipamento / satélite — vista principal ]" className="h-[360px] rounded-[14px]" />
            <div className="grid grid-cols-4 gap-2 mt-2.5 mb-8">
              <Ph label="[ vista 2 ]" className="h-[70px] rounded-[9px]" />
              <Ph label="[ sensor ]" className="h-[70px] rounded-[9px]" />
              <Ph label="[ cobertura ]" className="h-[70px] rounded-[9px]" />
              <Ph label="[ +4 ]" className="h-[70px] rounded-[9px]" />
            </div>

            <div className="mb-5">
              <Kicker>Ficha técnica</Kicker>
              <SectionTitle>Especificações</SectionTitle>
            </div>
            <div className="border border-line rounded-[14px] overflow-hidden mb-8">
              {specs.map(([k, v], i) => (
                <div key={k} className={`grid grid-cols-[150px_1fr] gap-4 px-4 py-3 border-b border-line last:border-0 ${i % 2 === 1 ? 'bg-panel' : ''}`}>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted self-center">{k}</span>
                  <span className="text-[13.5px] text-text self-center">{v}</span>
                </div>
              ))}
            </div>

            <div className="mb-3">
              <Kicker>Sobre</Kicker>
              <SectionTitle>Descrição do serviço</SectionTitle>
            </div>
            <p className="text-[14px] text-muted leading-relaxed mb-4">
              Janela de acesso ao {sat.nome}, operado pela {sat.operadora}. Indicado para coletas de {sat.categoria.toLowerCase()} com
              entrega de dados brutos e calibrados via portal seguro da plataforma.
            </p>
            <div className="flex gap-2 flex-wrap">
              {['Dados brutos', 'API de download', 'Suporte técnico', 'Licença pesquisa'].map(t => (
                <span key={t} className="px-2.5 py-1 rounded-[7px] bg-panel2 border border-line text-[12px] text-muted">{t}</span>
              ))}
            </div>
          </div>

          {/* price card sticky */}
          <aside className="lg:sticky lg:top-[78px]">
            <div className="bg-panel border border-line rounded-[14px] p-[22px] flex flex-col gap-3.5">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent">{sat.categoria}</p>
              <h1 className="font-display font-bold text-[20px] tracking-tight text-text leading-tight">{sat.nome}</h1>
              <div className="flex items-center gap-1.5 text-[12.5px] text-muted">
                <span className="w-5 h-5 rounded-full bg-accent/15 border border-accent/50 text-accent flex items-center justify-center text-[8px]">◍</span>
                {sat.operadora}
              </div>

              <div className="flex items-baseline gap-1.5 flex-wrap bg-panel2 border border-line rounded-[12px] p-3.5">
                <span className="text-[12px] text-dim">a partir de</span>
                <span className="font-display font-bold text-[26px] tracking-tight text-text">{sat.preco}</span>
                <span className="text-[12px] text-dim">{sat.unidade}</span>
              </div>

              <div className="flex flex-col">
                {[
                  ['Disponibilidade', <span className="text-done font-medium">Próx. janela em 3 dias</span>],
                  ['Tempo mínimo', '1 órbita (~90 min)'],
                  ['Entrega de dados', '24–48 h'],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between py-2.5 border-b border-line last:border-0 text-[13px]">
                    <span className="text-muted">{k}</span><span className="text-text">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <Btn full onClick={() => onRequest(sat)}>Solicitar uso →</Btn>
                <Btn full variant="ghost">Falar com a operadora</Btn>
              </div>
              <p className="text-[11.5px] text-dim text-center leading-relaxed">Sem cobrança até a confirmação da janela pela operadora.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
