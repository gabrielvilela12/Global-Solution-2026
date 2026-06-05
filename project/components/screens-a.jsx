/* Satellite dataset + screens: Login, Catálogo (Home), Detalhes */

const SATS = [
  { id: "goes", name: "GOES-Atlas 7", owner: "Meteora Space", cat: "Clima", orbit: "GEO · 35.786 km", cap: "Imageamento multiespectral · 16 bandas", res: "0,5 km / pixel", revisit: "Contínuo (geoestacionário)", price: "US$ 1.240", unit: "/ órbita" },
  { id: "orion", name: "LinkSat Orion", owner: "Vega Networks", cat: "Comunicação", orbit: "LEO · 550 km", cap: "Downlink banda Ka · 1,2 Gbps", res: "—", revisit: "8 passagens / dia", price: "US$ 880", unit: "/ hora" },
  { id: "terra", name: "TerraScan 12", owner: "GeoOrbit Labs", cat: "Topografia", orbit: "SSO · 620 km", cap: "Radar SAR banda-X", res: "1,0 m / pixel", revisit: "11 dias", price: "US$ 1.560", unit: "/ aquisição" },
  { id: "helios", name: "Helios Watch", owner: "Solaris Dynamics", cat: "Clima", orbit: "SSO · 705 km", cap: "Sondagem atmosférica · IR", res: "2,0 km / pixel", revisit: "2x / dia", price: "US$ 640", unit: "/ órbita" },
  { id: "relay", name: "RelaySat C2", owner: "NovaLink", cat: "Comunicação", orbit: "MEO · 8.000 km", cap: "Relay banda-S · baixa latência", res: "—", revisit: "Janelas de 40 min", price: "US$ 1.020", unit: "/ hora" },
  { id: "carto", name: "CartoSat HR", owner: "Andes Imaging", cat: "Topografia", orbit: "SSO · 505 km", cap: "Óptico pancromático", res: "0,3 m / pixel", revisit: "5 dias", price: "US$ 2.100", unit: "/ aquisição" },
];
window.SATS = SATS;

/* ================= TELA 1 — LOGIN / CADASTRO ================= */
function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState("entrar");
  return (
    <div className="scr scr-login">
      <TopBar minimal onNav={() => {}} />
      <div className="login-grid">
        {/* Left brand / context panel */}
        <aside className="login-aside">
          <Anno>painel de marca · contexto do produto</Anno>
          <Ph label="[ IMG · órbita / hero do produto ]" h="100%" className="login-hero" />
          <div className="login-aside__copy">
            <div className="wf-kicker">Space Economy · B2C</div>
            <h1 className="login-aside__title">Tempo de satélite sob demanda para pesquisa.</h1>
            <p className="login-aside__sub">Reserve janelas de observação de clima, comunicação e topografia direto com as operadoras.</p>
            <ul className="login-points">
              <li>◍ Catálogo de satélites verificados</li>
              <li>◍ Contratação por órbita, hora ou aquisição</li>
              <li>◍ Acompanhamento de missões em tempo real</li>
            </ul>
          </div>
        </aside>

        {/* Right form card */}
        <section className="login-formwrap">
          <div className="login-card">
            <Anno>formulário · auth limpa</Anno>
            <div className="login-tabs">
              <button className={"login-tab" + (tab === "entrar" ? " is-active" : "")} onClick={() => setTab("entrar")} type="button">Entrar</button>
              <button className={"login-tab" + (tab === "criar" ? " is-active" : "")} onClick={() => setTab("criar")} type="button">Criar conta</button>
            </div>

            {tab === "entrar" ? (
              <div className="login-form">
                <Field label="E-mail institucional" placeholder="nome@universidade.edu" required />
                <Field label="Senha" placeholder="••••••••" required />
                <div className="login-row">
                  <label className="wf-check"><span className="wf-check__box" />Manter conectado</label>
                  <button className="wf-link" type="button">Esqueci a senha</button>
                </div>
                <Btn full onClick={onLogin}>Entrar na plataforma</Btn>
                <div className="login-or"><span>ou</span></div>
                <Btn full variant="ghost" onClick={onLogin} icon="◎">Acessar com SSO institucional</Btn>
              </div>
            ) : (
              <div className="login-form">
                <div className="login-pair">
                  <Field label="Nome da instituição" placeholder="Universidade / Empresa" required />
                  <Field label="Tipo" type="select" placeholder="Universidade" required />
                </div>
                <Field label="E-mail institucional" placeholder="nome@universidade.edu" required />
                <div className="login-pair">
                  <Field label="Senha" placeholder="••••••••" required />
                  <Field label="Confirmar senha" placeholder="••••••••" required />
                </div>
                <label className="wf-check"><span className="wf-check__box" />Aceito os termos de uso e a política de dados orbitais</label>
                <Btn full onClick={onLogin}>Criar conta institucional</Btn>
                <p className="login-fine">Contas passam por verificação da instituição antes da primeira reserva.</p>
              </div>
            )}
          </div>
          <p className="login-switch">
            {tab === "entrar" ? "Novo por aqui? " : "Já tem cadastro? "}
            <button className="wf-link" onClick={() => setTab(tab === "entrar" ? "criar" : "entrar")} type="button">
              {tab === "entrar" ? "Criar conta para instituições" : "Fazer login"}
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}

/* ================= TELA 2 — HOME / CATÁLOGO ================= */
function HomeScreen({ onNav, onOpen }) {
  const filters = ["Todos", "Clima", "Comunicação", "Topografia"];
  const [active, setActive] = useState("Todos");
  const list = active === "Todos" ? SATS : SATS.filter((s) => s.cat === active);
  const counts = { Todos: SATS.length, Clima: 2, Comunicação: 2, Topografia: 2 };

  return (
    <div className="scr scr-home">
      <TopBar active="home" onNav={onNav} onLogout={() => onNav("login")} />

      {/* search hero */}
      <div className="home-hero">
        <div className="wf-wrap">
          <SectionHead kicker="Catálogo · 6 satélites disponíveis" title="Encontre tempo orbital sob demanda" />
          <div className="home-search">
            <span className="home-search__icon">⌕</span>
            <span className="home-search__ph">Buscar por satélite, operadora, sensor ou região…</span>
            <Btn sm>Buscar</Btn>
            <Anno side="below">barra de pesquisa global</Anno>
          </div>
        </div>
      </div>

      <div className="wf-wrap home-body">
        {/* filter rail */}
        <div className="home-filters">
          <span className="home-filters__label">Filtrar por capacidade</span>
          <div className="home-filters__chips">
            {filters.map((f) => (
              <Chip key={f} active={active === f} onClick={() => setActive(f)} count={counts[f]}>{f}</Chip>
            ))}
          </div>
          <div className="home-filters__more">
            <span className="home-sub">Órbita ▾</span>
            <span className="home-sub">Resolução ▾</span>
            <span className="home-sub">Preço ▾</span>
            <span className="home-sub home-sub--clear">Limpar</span>
          </div>
          <Anno side="below">filtros: Clima · Comunicação · Topografia</Anno>
        </div>

        {/* card grid */}
        <div className="home-grid">
          {list.map((s) => (
            <button key={s.id} className="sat-card" onClick={() => onOpen(s)} type="button">
              <Ph label="[ IMG · satélite ]" h="148px" className="sat-card__img" />
              <span className="sat-card__cat">{s.cat}</span>
              <div className="sat-card__body">
                <h3 className="sat-card__name">{s.name}</h3>
                <div className="sat-card__owner"><span className="wf-avatar wf-avatar--xs">◍</span>{s.owner}</div>
                <div className="sat-card__meta">
                  <span>{s.orbit.split(" · ")[0]}</span>
                  <span className="dot">·</span>
                  <span>{s.res !== "—" ? s.res : s.cap.split(" · ")[0]}</span>
                </div>
                <div className="sat-card__foot">
                  <span className="sat-card__price">{s.price}<small>{s.unit}</small></span>
                  <span className="sat-card__cta">Ver detalhes →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
window.HomeScreen = HomeScreen;
