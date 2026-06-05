/* Screens: Detalhes do Satélite, Solicitação (Checkout), Dashboard */

/* ================= TELA 3 — DETALHES DO SATÉLITE ================= */
function DetailScreen({ sat, onNav, onRequest }) {
  const s = sat || window.SATS[0];
  const specs = [
    ["Capacidade", s.cap],
    ["Órbita", s.orbit],
    ["Resolução", s.res],
    ["Revisita", s.revisit],
    ["Operadora", s.owner],
    ["Categoria", s.cat],
  ];
  return (
    <div className="scr scr-detail">
      <TopBar active="details" onNav={onNav} onLogout={() => onNav("login")} />
      <div className="wf-wrap detail-body">
        <Crumbs items={[{ label: "Catálogo", onClick: () => onNav("home") }, { label: s.cat, onClick: () => onNav("home") }, { label: s.name }]} />

        <div className="detail-grid">
          {/* left: gallery + specs */}
          <div className="detail-main">
            <Ph label="[ IMG · equipamento / satélite — vista principal ]" h="360px" className="detail-hero" />
            <div className="detail-thumbs">
              <Ph label="[ vista 2 ]" h="70px" />
              <Ph label="[ sensor ]" h="70px" />
              <Ph label="[ cobertura ]" h="70px" />
              <Ph label="[ +4 ]" h="70px" />
            </div>

            <SectionHead kicker="Ficha técnica" title="Especificações" />
            <Anno>ficha técnica: capacidade, órbita…</Anno>
            <div className="spec-table">
              {specs.map(([k, v]) => (
                <div className="spec-row" key={k}>
                  <span className="spec-row__k">{k}</span>
                  <span className="spec-row__v">{v}</span>
                </div>
              ))}
            </div>

            <SectionHead kicker="Sobre" title="Descrição do serviço" />
            <div className="detail-prose">
              <p>Janela de acesso ao {s.name}, operado pela {s.owner}. Indicado para coletas de {s.cat.toLowerCase()} com entrega de dados brutos e calibrados via portal.</p>
              <div className="detail-tags">
                <span className="wf-tag">Dados brutos</span>
                <span className="wf-tag">API de download</span>
                <span className="wf-tag">Suporte técnico</span>
                <span className="wf-tag">Licença pesquisa</span>
              </div>
            </div>
          </div>

          {/* right: sticky price / CTA */}
          <aside className="detail-side">
            <div className="price-card">
              <Anno>preço base + CTA de destaque</Anno>
              <div className="price-card__cat">{s.cat}</div>
              <h1 className="price-card__name">{s.name}</h1>
              <div className="price-card__owner"><span className="wf-avatar wf-avatar--xs">◍</span>{s.owner}</div>

              <div className="price-card__price">
                <span className="price-card__from">a partir de</span>
                <span className="price-card__val">{s.price}</span>
                <span className="price-card__unit">{s.unit}</span>
              </div>

              <div className="price-card__rows">
                <div className="price-card__row"><span>Disponibilidade</span><span className="ok-text">Próx. janela em 3 dias</span></div>
                <div className="price-card__row"><span>Tempo mínimo</span><span>1 órbita (~90 min)</span></div>
                <div className="price-card__row"><span>Entrega de dados</span><span>24–48 h</span></div>
              </div>

              <Btn full onClick={() => onRequest(s)}>Solicitar uso →</Btn>
              <Btn full variant="ghost">Falar com a operadora</Btn>
              <p className="price-card__fine">Sem cobrança até a confirmação da janela pela operadora.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ================= TELA 4 — SOLICITAÇÃO / CHECKOUT ================= */
function CheckoutScreen({ sat, onNav, onConfirm }) {
  const s = sat || window.SATS[0];
  return (
    <div className="scr scr-checkout">
      <TopBar active="checkout" onNav={onNav} onLogout={() => onNav("login")} />
      <div className="wf-wrap checkout-body">
        <Crumbs items={[{ label: "Catálogo", onClick: () => onNav("home") }, { label: s.name, onClick: () => onNav("details") }, { label: "Solicitação" }]} />

        <div className="checkout-grid">
          {/* form */}
          <div className="checkout-main">
            <SectionHead kicker="Etapa 1 de 1 · solicitação" title="Definir janela de uso" />
            <Anno>formulário simples · período + objetivo</Anno>

            <div className="form-block">
              <div className="form-block__head">Período do aluguel</div>
              <div className="checkout-pair">
                <Field label="Data de início" type="select" placeholder="dd / mm / aaaa" required hint="Sujeito à confirmação da janela orbital" />
                <Field label="Tempo necessário" type="select" placeholder="Selecione a duração" required hint={"Cobrado " + s.unit.replace("/", "por")} />
              </div>
              <div className="checkout-pair">
                <Field label="Faixa horária (UTC)" type="select" placeholder="Qualquer passagem" />
                <Field label="Prioridade" type="select" placeholder="Padrão" />
              </div>
            </div>

            <div className="form-block">
              <div className="form-block__head">Objetivo da missão</div>
              <Field label="Descreva o objetivo da coleta" type="area" placeholder="Ex.: monitorar cobertura de nuvens sobre a Amazônia para validação de modelo climático…" required hint="Ajuda a operadora a configurar o sensor e validar o uso." />
              <Field label="Anexar protocolo de pesquisa (opcional)" placeholder="↥  arraste um arquivo ou clique para enviar" />
            </div>

            <div className="checkout-actions">
              <Btn variant="ghost" onClick={() => onNav("details")}>← Voltar</Btn>
              <Btn onClick={onConfirm}>Confirmar solicitação</Btn>
            </div>
          </div>

          {/* order summary */}
          <aside className="checkout-side">
            <div className="summary-card">
              <Anno>resumo do pedido</Anno>
              <div className="summary-card__sat">
                <Ph label="[ IMG ]" h="56px" w="56px" />
                <div>
                  <div className="summary-card__name">{s.name}</div>
                  <div className="summary-card__owner">{s.owner}</div>
                </div>
              </div>
              <div className="summary-card__rows">
                <div className="summary-card__row"><span>Categoria</span><span>{s.cat}</span></div>
                <div className="summary-card__row"><span>Órbita</span><span>{s.orbit.split(" · ")[0]}</span></div>
                <div className="summary-card__row"><span>Preço base</span><span>{s.price} {s.unit}</span></div>
                <div className="summary-card__row"><span>Taxa de plataforma</span><span>US$ 120</span></div>
              </div>
              <div className="summary-card__total">
                <span>Estimativa</span>
                <span className="summary-card__totalval">US$ 1.360</span>
              </div>
              <p className="summary-card__fine">Valor final confirmado após aprovação da janela pela operadora.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ================= TELA 5 — DASHBOARD / MEUS ALUGUÉIS ================= */
function DashboardScreen({ onNav, flash }) {
  const base = [
    { id: "#ORB-2291", sat: "GOES-Atlas 7", owner: "Meteora Space", date: "12 jun 2026", dur: "3 órbitas", status: "analise", obj: "Cobertura de nuvens — Amazônia" },
    { id: "#ORB-2284", sat: "TerraScan 12", owner: "GeoOrbit Labs", date: "08 jun 2026", dur: "1 aquisição", status: "aprovado", obj: "Modelo de elevação — Andes" },
    { id: "#ORB-2270", sat: "LinkSat Orion", owner: "Vega Networks", date: "30 mai 2026", dur: "2 horas", status: "agendado", obj: "Teste de downlink banda Ka" },
    { id: "#ORB-2251", sat: "Helios Watch", owner: "Solaris Dynamics", date: "21 mai 2026", dur: "4 órbitas", status: "concluido", obj: "Sondagem atmosférica IR" },
    { id: "#ORB-2240", sat: "CartoSat HR", owner: "Andes Imaging", date: "14 mai 2026", dur: "1 aquisição", status: "recusado", obj: "Imageamento urbano 0,3 m" },
  ];
  const rows = flash ? [flash, ...base] : base;
  const stats = [
    ["Em análise", flash ? 2 : 1],
    ["Aprovados", 1],
    ["Em órbita / agendado", 1],
    ["Concluídos", 1],
  ];

  return (
    <div className="scr scr-dash">
      <TopBar active="dashboard" onNav={onNav} onLogout={() => onNav("login")} />
      <div className="wf-wrap dash-body">
        <SectionHead
          kicker="Painel da instituição"
          title="Meus aluguéis"
          right={<Btn onClick={() => onNav("home")} icon="＋">Nova solicitação</Btn>}
        />

        {flash && (
          <div className="dash-flash">
            ✓ Solicitação <strong>{flash.id}</strong> enviada — aguardando análise da operadora.
          </div>
        )}

        {/* stat tiles */}
        <div className="dash-stats">
          {stats.map(([k, v]) => (
            <div className="dash-stat" key={k}>
              <span className="dash-stat__v">{v}</span>
              <span className="dash-stat__k">{k}</span>
            </div>
          ))}
          <Anno side="below">acompanhamento por status</Anno>
        </div>

        {/* requests table */}
        <div className="dash-tablewrap">
          <div className="dash-toolbar">
            <div className="dash-tabs">
              <span className="dash-tab is-active">Todos</span>
              <span className="dash-tab">Em andamento</span>
              <span className="dash-tab">Concluídos</span>
            </div>
            <span className="home-sub">Ordenar: mais recentes ▾</span>
          </div>

          <table className="dash-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Satélite</th>
                <th>Objetivo da missão</th>
                <th>Início</th>
                <th>Duração</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={flash && i === 0 ? "is-new" : ""}>
                  <td className="mono">{r.id}</td>
                  <td>
                    <div className="dash-sat"><span className="wf-avatar wf-avatar--xs">◍</span>
                      <div><div className="dash-sat__name">{r.sat}</div><div className="dash-sat__owner">{r.owner}</div></div>
                    </div>
                  </td>
                  <td className="dash-obj">{r.obj}</td>
                  <td className="mono">{r.date}</td>
                  <td>{r.dur}</td>
                  <td><StatusPill status={r.status} /></td>
                  <td><button className="dash-rowcta" type="button">⋯</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.DetailScreen = DetailScreen;
window.CheckoutScreen = CheckoutScreen;
window.DashboardScreen = DashboardScreen;
