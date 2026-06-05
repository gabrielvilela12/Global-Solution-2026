import { useState } from 'react'
import { criarSolicitacao } from '../api/client.js'
import { TopBar, Kicker, SectionTitle, Crumbs, Ph, Field, Btn } from '../components/ui.jsx'

export default function CheckoutScreen({ sat, onNav, onConfirm }) {
  const [dataInicio, setDataInicio] = useState('')
  const [duracao, setDuracao] = useState('')
  const [faixa, setFaixa] = useState('')
  const [prioridade, setPrioridade] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!sat) return null

  const unidade = sat.unidade?.replace('/ ', '').replace('/', '') || 'órbita'
  const duracaoOpts = [`1 ${unidade}`, `2 ${unidade}`, `3 ${unidade}`, `4 ${unidade}`]

  const handleSubmit = async () => {
    if (!objetivo.trim()) { setError('Descreva o objetivo da coleta.'); return }
    setLoading(true)
    setError(null)
    try {
      const result = await criarSolicitacao({ sateliteId: sat.id, objetivo, dataInicio, duracao })
      onConfirm(result)
    } catch (e) {
      setError(e.message + ' — verifique se o backend está rodando.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <TopBar active="checkout" onNav={onNav} />
      <div className="max-w-page mx-auto px-6 py-7">
        <Crumbs items={[
          { label: 'Catálogo', onClick: () => onNav('home') },
          { label: sat.nome, onClick: () => onNav('details') },
          { label: 'Solicitação' },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-7 items-start">
          {/* formulário */}
          <div>
            <Kicker>Etapa 1 de 1 · solicitação</Kicker>
            <SectionTitle className="mb-6">Definir janela de uso</SectionTitle>

            <div className="bg-panel border border-line rounded-[14px] p-[22px] mb-[18px]">
              <h3 className="font-mono text-[12px] uppercase tracking-wider text-muted mb-4 pb-3.5 border-b border-line">Período do aluguel</h3>
              <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                <Field label="Data de início" type="date" value={dataInicio} onChange={setDataInicio} required hint="Sujeito à confirmação da janela orbital" />
                <Field label="Tempo necessário" type="select" placeholder="Selecione a duração" options={duracaoOpts} value={duracao} onChange={setDuracao} required hint={`Cobrado por ${unidade}`} />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <Field label="Faixa horária (UTC)" type="select" placeholder="Qualquer passagem" options={['Qualquer passagem', '00–06h', '06–12h', '12–18h', '18–24h']} value={faixa} onChange={setFaixa} />
                <Field label="Prioridade" type="select" placeholder="Padrão" options={['Padrão', 'Alta', 'Urgente']} value={prioridade} onChange={setPrioridade} />
              </div>
            </div>

            <div className="bg-panel border border-line rounded-[14px] p-[22px] mb-[18px]">
              <h3 className="font-mono text-[12px] uppercase tracking-wider text-muted mb-4 pb-3.5 border-b border-line">Objetivo da missão</h3>
              <div className="flex flex-col gap-4">
                <Field label="Descreva o objetivo da coleta" type="area" value={objetivo} onChange={setObjetivo} required
                  placeholder="Ex.: monitorar cobertura de nuvens sobre a Amazônia para validação de modelo climático…"
                  hint="Ajuda a operadora a configurar o sensor e validar o uso." />
                <Field label="Anexar protocolo de pesquisa (opcional)" type="static" placeholder="↥  arraste um arquivo ou clique para enviar" />
              </div>
            </div>

            {error && <p className="text-stop text-sm mb-4">{error}</p>}

            <div className="flex justify-between">
              <Btn variant="ghost" onClick={() => onNav('details')}>← Voltar</Btn>
              <Btn onClick={handleSubmit} disabled={loading}>{loading ? 'Enviando…' : 'Confirmar solicitação'}</Btn>
            </div>
          </div>

          {/* resumo do pedido */}
          <aside className="lg:sticky lg:top-[78px]">
            <div className="bg-panel border border-line rounded-[14px] p-5">
              <div className="flex gap-3 items-center mb-4 pb-4 border-b border-line">
                <Ph label="[ IMG ]" className="w-14 h-14 rounded-[9px] shrink-0" />
                <div>
                  <p className="font-display font-bold text-[14px] text-text">{sat.nome}</p>
                  <p className="text-[12px] text-muted">{sat.operadora}</p>
                </div>
              </div>
              <div className="flex flex-col">
                {[
                  ['Categoria', sat.categoria],
                  ['Órbita', sat.orbita?.split(' · ')[0]],
                  ['Preço base', `${sat.preco} ${sat.unidade}`],
                  ['Taxa de plataforma', 'US$ 120'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-line last:border-0 text-[13px]">
                    <span className="text-muted">{k}</span><span className="text-text">{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3.5 mt-1 border-t border-line2 font-semibold">
                <span className="text-[14px]">Estimativa</span>
                <span className="font-display font-bold text-[20px] tracking-tight text-text">US$ 1.360</span>
              </div>
              <p className="text-[11.5px] text-dim mt-2.5 leading-relaxed">Valor final confirmado após aprovação da janela pela operadora.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
