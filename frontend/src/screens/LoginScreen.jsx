import { useState } from 'react'
import { TopBar, Kicker, Field, Btn } from '../components/ui.jsx'
import { login, cadastrar } from '../api/client.js'

const STRIPES = {
  backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 7px, rgba(120,160,230,.045) 7px, rgba(120,160,230,.045) 8px)',
}

export default function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState('entrar')

  // campos
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [instituicao, setInstituicao] = useState('')
  const [tipo, setTipo] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [manter, setManter] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const trocarTab = (t) => { setTab(t); setError(null) }

  const handleEntrar = async () => {
    if (!email.trim() || !senha) { setError('Preencha e-mail e senha.'); return }
    setLoading(true); setError(null)
    try {
      const user = await login(email, senha)
      onLogin(user, manter)
    } catch (e) {
      setError(e.message); setLoading(false)
    }
  }

  const handleCriar = async () => {
    if (!instituicao.trim() || !email.trim() || !senha) { setError('Preencha instituição, e-mail e senha.'); return }
    if (senha !== confirmar) { setError('As senhas não conferem.'); return }
    setLoading(true); setError(null)
    try {
      const user = await cadastrar({ instituicao, tipo: tipo || 'Universidade', email, senha })
      onLogin(user)
    } catch (e) {
      setError(e.message); setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <TopBar minimal onNav={() => {}} />

      <div className="flex-1 flex items-center justify-center px-6 py-6">
        <div className="w-full max-w-[1240px] grid grid-cols-1 lg:grid-cols-[1fr_560px] gap-6 items-center">

          {/* painel de marca — card com hero + copy */}
          <aside className="hidden lg:block relative rounded-[16px] overflow-hidden border border-line bg-panel min-h-[82vh]">
            <div className="absolute inset-0" style={STRIPES} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[11px] text-dim">[ IMG · órbita / hero do produto ]</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-10 pt-20"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,.95) 0%, rgba(0,0,0,.9) 38%, rgba(0,0,0,.5) 72%, transparent 100%)' }}>
              <div className="max-w-[320px] ml-auto">
                <Kicker>Space Economy · B2C</Kicker>
                <h1 className="font-display font-bold text-[32px] leading-[1.1] tracking-tight text-text mb-4">
                  Tempo de satélite sob demanda para pesquisa.
                </h1>
                <p className="font-mono text-[12.5px] text-muted leading-relaxed mb-5">
                  Reserve janelas de observação de clima, comunicação e topografia direto com as operadoras.
                </p>
                <ul className="flex flex-col gap-3 font-mono text-[12px] text-muted">
                  <li className="flex items-start gap-2.5"><span className="text-accent">◉</span> Catálogo de satélites verificados</li>
                  <li className="flex items-start gap-2.5"><span className="text-accent">◉</span> Contratação por órbita, hora ou aquisição</li>
                  <li className="flex items-start gap-2.5"><span className="text-accent">◉</span> Acompanhamento de missões em tempo real</li>
                </ul>
              </div>
            </div>
          </aside>

          {/* formulário */}
          <section className="w-full">
            <div className="bg-panel border border-line rounded-[16px] p-10">
              <div className="flex bg-bg2 border border-line rounded-[9px] p-1 mb-6">
                <button onClick={() => trocarTab('entrar')} type="button"
                  className={`flex-1 h-9 rounded-[6px] text-[13.5px] font-medium transition ${tab === 'entrar' ? 'bg-panel2 text-text shadow' : 'text-muted'}`}>
                  Entrar
                </button>
                <button onClick={() => trocarTab('criar')} type="button"
                  className={`flex-1 h-9 rounded-[6px] text-[13.5px] font-medium transition ${tab === 'criar' ? 'bg-panel2 text-text shadow' : 'text-muted'}`}>
                  Criar conta
                </button>
              </div>

              {tab === 'entrar' ? (
                <div className="flex flex-col gap-4">
                  <Field label="E-mail institucional" type="email" placeholder="nome@universidade.edu" value={email} onChange={setEmail} required />
                  <Field label="Senha" type="password" placeholder="••••••••" value={senha} onChange={setSenha} required />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[13px] text-muted cursor-pointer select-none">
                      <input type="checkbox" checked={manter} onChange={e => setManter(e.target.checked)} className="sr-only" />
                      <span className={`w-4 h-4 rounded border flex items-center justify-center transition ${manter ? 'bg-accent border-accent text-ink' : 'border-line bg-panel'}`}>
                        {manter && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                        )}
                      </span>
                      Manter conectado
                    </label>
                    <button type="button" className="text-[13px] text-accent hover:opacity-80">Esqueci a senha</button>
                  </div>
                  {error && <p className="text-stop text-[13px]">{error}</p>}
                  <Btn full onClick={handleEntrar} disabled={loading}>{loading ? 'Entrando…' : 'Entrar na plataforma'}</Btn>
                  <div className="flex items-center gap-3 text-[12px] text-dim">
                    <span className="flex-1 h-px bg-line" />ou<span className="flex-1 h-px bg-line" />
                  </div>
                  <Btn full variant="ghost" disabled>◎ Acessar com SSO institucional</Btn>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Instituição" placeholder="Universidade / Empresa" value={instituicao} onChange={setInstituicao} required />
                    <Field label="Tipo" type="select" placeholder="Universidade" options={['Universidade', 'Empresa', 'Centro de pesquisa']} value={tipo} onChange={setTipo} required />
                  </div>
                  <Field label="E-mail institucional" type="email" placeholder="nome@universidade.edu" value={email} onChange={setEmail} required />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Senha" type="password" placeholder="••••••••" value={senha} onChange={setSenha} required />
                    <Field label="Confirmar" type="password" placeholder="••••••••" value={confirmar} onChange={setConfirmar} required />
                  </div>
                  <label className="flex items-start gap-2 text-[13px] text-muted cursor-pointer">
                    <span className="w-4 h-4 border border-line rounded bg-panel mt-0.5 shrink-0" />
                    Aceito os termos de uso e a política de dados orbitais
                  </label>
                  {error && <p className="text-stop text-[13px]">{error}</p>}
                  <Btn full onClick={handleCriar} disabled={loading}>{loading ? 'Criando…' : 'Criar conta institucional'}</Btn>
                  <p className="text-[11.5px] text-dim text-center leading-relaxed">
                    Contas passam por verificação da instituição antes da primeira reserva.
                  </p>
                </div>
              )}
            </div>

            <p className="mt-4 text-[13px] text-dim text-center">
              {tab === 'entrar' ? 'Novo por aqui? ' : 'Já tem cadastro? '}
              <button onClick={() => trocarTab(tab === 'entrar' ? 'criar' : 'entrar')} type="button" className="text-accent hover:opacity-80">
                {tab === 'entrar' ? 'Criar conta para instituições' : 'Fazer login'}
              </button>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
