const platforms = [
  {
    id: "biocube",
    name: "BioCube-2",
    operator: "NanoOrbit Systems",
    category: "Biotecnologia",
    orbit: "LEO 525 km",
    window: "12 jun 2026",
    duration: 14,
    energy: 42,
    storage: 180,
    sensors: ["microgravidade", "termal", "câmera macro"],
    price: 3200,
    status: "Disponível",
    imageTone: "teal",
    description:
      "Módulo pressurizado para ensaios biológicos em microgravidade, com controle térmico fino e telemetria contínua.",
  },
  {
    id: "materials",
    name: "Helios Materials Rack",
    operator: "Solaris Dynamics",
    category: "Materiais",
    orbit: "SSO 705 km",
    window: "18 jun 2026",
    duration: 21,
    energy: 56,
    storage: 120,
    sensors: ["radiação", "termal", "espectrômetro"],
    price: 4100,
    status: "Alta demanda",
    imageTone: "amber",
    description:
      "Rack externo para exposição de ligas, polímeros e revestimentos a ciclos térmicos, radiação e vácuo orbital.",
  },
  {
    id: "sensorpod",
    name: "SensorPod Aurora",
    operator: "Orbital Edge",
    category: "Sensores",
    orbit: "LEO 480 km",
    window: "21 jun 2026",
    duration: 10,
    energy: 28,
    storage: 96,
    sensors: ["câmera", "banda S", "IMU"],
    price: 2600,
    status: "Disponível",
    imageTone: "violet",
    description:
      "Baia modular para validação de sensores embarcados, comunicação, orientação e aquisição de dados de baixa potência.",
  },
  {
    id: "edulab",
    name: "EduLab Kibo Slot",
    operator: "JAXA Partner Lab",
    category: "Educação",
    orbit: "ISS 408 km",
    window: "25 jun 2026",
    duration: 7,
    energy: 18,
    storage: 48,
    sensors: ["câmera macro", "termal"],
    price: 1800,
    status: "Disponível",
    imageTone: "coral",
    description:
      "Janela compacta para demonstrações educacionais com vídeo programado, telemetria simplificada e relatório final.",
  },
  {
    id: "comms",
    name: "LinkSat Comms Bench",
    operator: "Vega Networks",
    category: "Comunicação",
    orbit: "MEO 8.000 km",
    window: "30 jun 2026",
    duration: 18,
    energy: 46,
    storage: 72,
    sensors: ["banda Ka", "banda S", "telemetria"],
    price: 3600,
    status: "Disponível",
    imageTone: "lime",
    description:
      "Bancada orbital para validar protocolos de downlink, latência e redundância de comunicação em ambiente real.",
  },
  {
    id: "carto",
    name: "CartoSat Experiment Bay",
    operator: "Andes Imaging",
    category: "Topografia",
    orbit: "SSO 505 km",
    window: "04 jul 2026",
    duration: 12,
    energy: 34,
    storage: 220,
    sensors: ["óptico", "radar", "câmera"],
    price: 3900,
    status: "Janela limitada",
    imageTone: "blue",
    description:
      "Baia de imageamento para ensaios de calibração, validação de algoritmos e coleta programada de dados orbitais.",
  },
];

const baseReservations = [
  {
    id: "ORB-2291",
    experiment: "Bioensaio de microalgas",
    platform: "BioCube-2",
    operator: "NanoOrbit Systems",
    date: "12 jun 2026",
    status: "analysis",
    score: 91,
    value: 3200,
  },
  {
    id: "ORB-2284",
    experiment: "Polímero de alta radiação",
    platform: "Helios Materials Rack",
    operator: "Solaris Dynamics",
    date: "18 jun 2026",
    status: "approved",
    score: 84,
    value: 4100,
  },
  {
    id: "ORB-2270",
    experiment: "Validação banda Ka",
    platform: "LinkSat Comms Bench",
    operator: "Vega Networks",
    date: "30 mai 2026",
    status: "scheduled",
    score: 79,
    value: 3600,
  },
  {
    id: "ORB-2251",
    experiment: "Aula demonstrativa em microgravidade",
    platform: "EduLab Kibo Slot",
    operator: "JAXA Partner Lab",
    date: "21 mai 2026",
    status: "done",
    score: 88,
    value: 1800,
  },
];

const state = {
  screen: "login",
  authTab: "login",
  catalogFilter: "Todos",
  catalogSearch: "",
  selectedPlatformId: "biocube",
  experiment: defaultExperiment(),
  recommendations: [],
  reservations: [...baseReservations],
  flash: "",
  dashboardFilter: "Todos",
};

function defaultExperiment() {
  return {
    organization: "FIAP BioTech Lab",
    title: "Bioensaio de microalgas",
    area: "Biotecnologia",
    duration: 9,
    energy: 18,
    storage: 64,
    budget: 4200,
    start: "2026-06-12",
    sensors: ["microgravidade", "termal", "câmera macro"],
    objective:
      "Testar crescimento de microalgas em microgravidade com controle térmico e registro por imagem macro.",
  };
}

const app = document.querySelector("#app");

function money(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function selectedPlatform() {
  return platforms.find((platform) => platform.id === state.selectedPlatformId) || platforms[0];
}

function icon(name) {
  const paths = {
    search:
      '<path d="M10.5 18a7.5 7.5 0 1 1 5.3-12.8 7.5 7.5 0 0 1 0 10.6L21 21" /><path d="m16 16 5 5" />',
    plus: '<path d="M12 5v14" /><path d="M5 12h14" />',
    arrow: '<path d="M5 12h14" /><path d="m13 6 6 6-6 6" />',
    check: '<path d="m5 12 4 4L19 6" />',
    chart: '<path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16v-5" /><path d="M12 16V8" /><path d="M16 16v-8" />',
    orbit:
      '<path d="M4 12a8 3.5 0 1 0 16 0 8 3.5 0 1 0-16 0" /><path d="M12 4a8 8 0 0 1 8 8" /><circle cx="12" cy="12" r="2" />',
    lab: '<path d="M9 3h6" /><path d="M10 3v5l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17l-5-9V3" /><path d="M8 15h8" />',
    save: '<path d="M5 4h12l2 2v14H5z" /><path d="M8 4v6h8V4" /><path d="M8 20v-6h8v6" />',
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.orbit}</svg>`;
}

function shell(content) {
  if (state.screen === "login") {
    return `<main>${content}</main>`;
  }

  return `
    <div class="app-shell">
      <header class="topbar">
        <button class="brand" type="button" data-screen="home" aria-label="Ir para início">
          <span class="brand-mark">${icon("orbit")}</span>
          <span><strong>OrbitLab</strong><small>Space Connect</small></span>
        </button>
        <nav class="nav">
          ${navButton("home", "Início")}
          ${navButton("catalog", "Catálogo")}
          ${navButton("experiment", "Experimento")}
          ${navButton("dashboard", "Dashboard")}
          ${navButton("capacity", "Operadora")}
        </nav>
        <button class="account-button" type="button" data-action="logout">
          <span class="avatar">FB</span>
          <span><strong>FIAP BioTech</strong><small>Pesquisador</small></span>
        </button>
      </header>
      <main class="screen">${content}</main>
    </div>
  `;
}

function navButton(screen, label) {
  const active =
    state.screen === screen ||
    (screen === "catalog" && ["detail", "compatibility", "checkout"].includes(state.screen));
  return `<button class="nav-item ${active ? "is-active" : ""}" type="button" data-screen="${screen}">${label}</button>`;
}

function render() {
  const screens = {
    login: renderLogin,
    home: renderHome,
    catalog: renderCatalog,
    detail: renderDetail,
    experiment: renderExperiment,
    compatibility: renderCompatibility,
    checkout: renderCheckout,
    dashboard: renderDashboard,
    capacity: renderCapacity,
  };
  app.innerHTML = shell((screens[state.screen] || renderHome)());
  syncRangeLabels();
}

function renderLogin() {
  const isLogin = state.authTab === "login";
  return `
    <section class="login-screen">
      <div class="login-visual">
        <img src="assets/orbitlab-hero.png" alt="Módulo orbital laboratorial em órbita da Terra" />
        <div class="login-copy">
          <span class="eyebrow">Space Connect</span>
          <h1>OrbitLab</h1>
          <p>Experimentos espaciais sob demanda para universidades, startups e laboratórios.</p>
          <div class="login-metrics">
            <span><strong>6</strong> plataformas</span>
            <span><strong>91</strong> score máximo</span>
            <span><strong>24-48h</strong> validação</span>
          </div>
        </div>
      </div>
      <div class="login-panel">
        <button class="brand brand-login" type="button" data-screen="login">
          <span class="brand-mark">${icon("orbit")}</span>
          <span><strong>OrbitLab</strong><small>Laboratório orbital sob demanda</small></span>
        </button>
        <div class="segmented">
          <button class="${isLogin ? "is-active" : ""}" type="button" data-auth-tab="login">Entrar</button>
          <button class="${!isLogin ? "is-active" : ""}" type="button" data-auth-tab="signup">Cadastrar</button>
        </div>
        <form class="stack" data-form="${isLogin ? "login" : "signup"}">
          ${
            isLogin
              ? `
                <label class="field">
                  <span>E-mail institucional</span>
                  <input name="email" type="email" value="pesquisador@fiap.com.br" required />
                </label>
                <label class="field">
                  <span>Senha</span>
                  <input name="password" type="password" value="orbitlab" required />
                </label>
                <div class="form-row compact-row">
                  <label class="checkbox"><input type="checkbox" checked /> Manter conectado</label>
                  <button class="link-button" type="button">Recuperar senha</button>
                </div>
                <button class="primary-button full" type="submit">${icon("arrow")} Entrar na plataforma</button>
              `
              : `
                <label class="field">
                  <span>Instituição</span>
                  <input name="org" value="FIAP BioTech Lab" required />
                </label>
                <div class="form-row">
                  <label class="field">
                    <span>Perfil</span>
                    <select name="profile">
                      <option>Universidade</option>
                      <option>Startup</option>
                      <option>Operadora espacial</option>
                    </select>
                  </label>
                  <label class="field">
                    <span>E-mail</span>
                    <input name="email" type="email" value="contato@fiap.com.br" required />
                  </label>
                </div>
                <label class="checkbox"><input type="checkbox" checked /> Aceito os termos de uso orbital</label>
                <button class="primary-button full" type="submit">${icon("check")} Criar conta</button>
              `
          }
        </form>
      </div>
    </section>
  `;
}

function renderHome() {
  const recs = rankedPlatforms(state.experiment).slice(0, 3);
  return `
    <section class="home-hero band">
      <div class="hero-copy">
        <span class="eyebrow">Marketplace orbital</span>
        <h1>Reserve capacidade experimental compatível com sua pesquisa.</h1>
        <p>Cadastre requisitos técnicos, compare plataformas e acompanhe reservas em uma experiência única.</p>
        <div class="hero-actions">
          <button class="primary-button" type="button" data-screen="experiment">${icon("lab")} Novo experimento</button>
          <button class="secondary-button" type="button" data-screen="catalog">${icon("search")} Explorar catálogo</button>
        </div>
      </div>
      <div class="mission-panel">
        <span class="panel-title">Experimento em foco</span>
        <h2>${state.experiment.title}</h2>
        <div class="mission-list">
          <span>Área <strong>${state.experiment.area}</strong></span>
          <span>Duração <strong>${state.experiment.duration} dias</strong></span>
          <span>Orçamento <strong>${money(state.experiment.budget)}</strong></span>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-head">
        <div>
          <span class="eyebrow">Recomendações</span>
          <h2>Plataformas mais compatíveis</h2>
        </div>
        <button class="text-command" type="button" data-screen="compatibility">Ver análise completa</button>
      </div>
      <div class="recommendation-grid">
        ${recs.map((item) => platformCard(item.platform, item.score)).join("")}
      </div>
    </section>

    <section class="content-section split-layout">
      <div>
        <div class="section-head tight">
          <div>
            <span class="eyebrow">Fluxo</span>
            <h2>Reserva de experimento espacial</h2>
          </div>
        </div>
        ${flowSteps()}
      </div>
      <div class="stats-strip">
        ${statTile("Compatibilidade média", "84%")}
        ${statTile("Taxa de ocupação", "68%")}
        ${statTile("Receita simulada", money(12700))}
      </div>
    </section>
  `;
}

function flowSteps() {
  const steps = [
    ["1", "Cadastro", "Requisitos técnicos do experimento"],
    ["2", "Score", "Cálculo de compatibilidade"],
    ["3", "Reserva", "Janela experimental confirmada"],
    ["4", "Dashboard", "Histórico e estatísticas atualizados"],
  ];
  return `<div class="flow-steps">${steps
    .map(
      ([num, title, body]) =>
        `<div class="flow-step"><span>${num}</span><strong>${title}</strong><small>${body}</small></div>`,
    )
    .join("")}</div>`;
}

function statTile(label, value) {
  return `<div class="stat-tile"><strong>${value}</strong><span>${label}</span></div>`;
}

function renderCatalog() {
  const categories = ["Todos", ...new Set(platforms.map((platform) => platform.category))];
  const query = state.catalogSearch.trim().toLowerCase();
  const visible = platforms.filter((platform) => {
    const filterMatch = state.catalogFilter === "Todos" || platform.category === state.catalogFilter;
    const queryMatch =
      !query ||
      [platform.name, platform.operator, platform.category, platform.orbit, platform.sensors.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query);
    return filterMatch && queryMatch;
  });

  return `
    <section class="catalog-tools">
      <div class="search-box">
        ${icon("search")}
        <input type="search" data-catalog-search placeholder="Buscar por plataforma, sensor, operadora ou órbita" value="${state.catalogSearch}" />
      </div>
      <div class="chips" role="list" aria-label="Categorias">
        ${categories
          .map(
            (category) =>
              `<button class="chip ${state.catalogFilter === category ? "is-active" : ""}" type="button" data-filter="${category}">${category}<span>${category === "Todos" ? platforms.length : platforms.filter((p) => p.category === category).length}</span></button>`,
          )
          .join("")}
      </div>
    </section>
    <section class="content-section">
      <div class="section-head">
        <div>
          <span class="eyebrow">Catálogo</span>
          <h1>Plataformas orbitais disponíveis</h1>
        </div>
        <button class="secondary-button" type="button" data-screen="experiment">${icon("plus")} Cadastrar experimento</button>
      </div>
      <div class="platform-grid">
        ${visible.map((platform) => platformCard(platform, scorePlatform(platform, state.experiment).score)).join("")}
      </div>
    </section>
  `;
}

function platformCard(platform, score) {
  return `
    <article class="platform-card">
      <button class="platform-media media-${platform.imageTone}" type="button" data-platform="${platform.id}" aria-label="Abrir ${platform.name}">
        <img src="assets/orbitlab-hero.png" alt="" />
        <span>${platform.category}</span>
      </button>
      <div class="platform-body">
        <div>
          <h3>${platform.name}</h3>
          <p>${platform.operator}</p>
        </div>
        <div class="platform-meta">
          <span>${platform.orbit}</span>
          <span>${platform.duration} dias</span>
          <span>${money(platform.price)}</span>
        </div>
        <div class="score-row">
          <span>Compatibilidade</span>
          <strong>${score}</strong>
        </div>
        <div class="meter" aria-hidden="true"><span style="width:${score}%"></span></div>
        <button class="text-command" type="button" data-platform="${platform.id}">Ver detalhes</button>
      </div>
    </article>
  `;
}

function renderDetail() {
  const platform = selectedPlatform();
  const result = scorePlatform(platform, state.experiment);
  return `
    <section class="detail-layout">
      <div>
        <button class="back-button" type="button" data-screen="catalog">Catálogo</button>
        <div class="detail-media media-${platform.imageTone}">
          <img src="assets/orbitlab-hero.png" alt="Módulo orbital laboratorial em órbita" />
          <span>${platform.status}</span>
        </div>
        <section class="content-section no-pad">
          <div class="section-head">
            <div>
              <span class="eyebrow">Ficha técnica</span>
              <h2>Capacidade experimental</h2>
            </div>
          </div>
          <div class="spec-grid">
            ${spec("Operadora", platform.operator)}
            ${spec("Categoria", platform.category)}
            ${spec("Órbita", platform.orbit)}
            ${spec("Energia", `${platform.energy} Wh`)}
            ${spec("Armazenamento", `${platform.storage} GB`)}
            ${spec("Sensores", platform.sensors.join(", "))}
          </div>
        </section>
      </div>
      <aside class="side-panel">
        <span class="eyebrow">${platform.category}</span>
        <h1>${platform.name}</h1>
        <p>${platform.description}</p>
        <div class="price-line">
          <span>a partir de</span>
          <strong>${money(platform.price)}</strong>
        </div>
        <div class="compat-block">
          <div class="score-row large"><span>Score para o experimento atual</span><strong>${result.score}</strong></div>
          <div class="meter"><span style="width:${result.score}%"></span></div>
          ${result.reasons.map((reason) => `<div class="reason">${icon(reason.ok ? "check" : "arrow")} ${reason.label}</div>`).join("")}
        </div>
        <button class="primary-button full" type="button" data-action="reserve-platform" data-platform-id="${platform.id}">${icon("arrow")} Reservar janela</button>
        <button class="secondary-button full" type="button" data-screen="experiment">${icon("lab")} Ajustar experimento</button>
      </aside>
    </section>
  `;
}

function spec(label, value) {
  return `<div class="spec"><span>${label}</span><strong>${value}</strong></div>`;
}

function renderExperiment() {
  return `
    <section class="form-layout">
      <div>
        <div class="section-head">
          <div>
            <span class="eyebrow">Cadastro de experimento</span>
            <h1>Defina os requisitos da missão</h1>
          </div>
        </div>
        <form class="form-surface" data-form="experiment">
          <div class="form-row">
            <label class="field">
              <span>Instituição</span>
              <input name="organization" value="${state.experiment.organization}" required />
            </label>
            <label class="field">
              <span>Área científica</span>
              <select name="area">
                ${["Biotecnologia", "Materiais", "Sensores", "Educação", "Comunicação", "Topografia"]
                  .map((area) => `<option ${state.experiment.area === area ? "selected" : ""}>${area}</option>`)
                  .join("")}
              </select>
            </label>
          </div>
          <label class="field">
            <span>Nome do experimento</span>
            <input name="title" value="${state.experiment.title}" required />
          </label>
          <label class="field">
            <span>Objetivo</span>
            <textarea name="objective" rows="4" required>${state.experiment.objective}</textarea>
          </label>
          <div class="range-grid">
            ${rangeField("duration", "Duração desejada", state.experiment.duration, 3, 30, "dias")}
            ${rangeField("energy", "Energia necessária", state.experiment.energy, 10, 70, "Wh")}
            ${rangeField("storage", "Armazenamento", state.experiment.storage, 24, 240, "GB")}
            ${rangeField("budget", "Orçamento", state.experiment.budget, 1200, 6000, "USD", 100)}
          </div>
          <fieldset class="field-group">
            <legend>Sensores necessários</legend>
            ${["microgravidade", "termal", "câmera macro", "radiação", "espectrômetro", "banda Ka", "radar", "óptico"]
              .map(
                (sensor) =>
                  `<label class="checkbox"><input type="checkbox" name="sensors" value="${sensor}" ${
                    state.experiment.sensors.includes(sensor) ? "checked" : ""
                  } /> ${sensor}</label>`,
              )
              .join("")}
          </fieldset>
          <div class="form-row">
            <label class="field">
              <span>Data desejada</span>
              <input name="start" type="date" value="${state.experiment.start}" />
            </label>
            <label class="field">
              <span>Prioridade</span>
              <select name="priority">
                <option>Padrão</option>
                <option>Janela mais próxima</option>
                <option>Menor custo</option>
              </select>
            </label>
          </div>
          <div class="form-actions">
            <button class="secondary-button" type="button" data-screen="catalog">Cancelar</button>
            <button class="primary-button" type="submit">${icon("chart")} Calcular compatibilidade</button>
          </div>
        </form>
      </div>
      <aside class="side-panel soft">
        <span class="eyebrow">Prévia</span>
        <h2>${state.experiment.title}</h2>
        <div class="mission-list">
          <span>Duração <strong>${state.experiment.duration} dias</strong></span>
          <span>Energia <strong>${state.experiment.energy} Wh</strong></span>
          <span>Armazenamento <strong>${state.experiment.storage} GB</strong></span>
          <span>Orçamento <strong>${money(state.experiment.budget)}</strong></span>
        </div>
        <p class="muted">O sistema compara requisitos de energia, sensores, armazenamento, duração, orçamento e área científica.</p>
      </aside>
    </section>
  `;
}

function rangeField(name, label, value, min, max, unit, step = 1) {
  return `
    <label class="field range-field">
      <span>${label}</span>
      <input type="range" name="${name}" min="${min}" max="${max}" step="${step}" value="${value}" data-range="${name}" />
      <strong data-range-label="${name}">${unit === "USD" ? money(value) : `${value} ${unit}`}</strong>
    </label>
  `;
}

function renderCompatibility() {
  state.recommendations = rankedPlatforms(state.experiment);
  return `
    <section class="content-section">
      <div class="section-head">
        <div>
          <span class="eyebrow">Compatibilidade</span>
          <h1>Plataformas recomendadas para ${state.experiment.title}</h1>
        </div>
        <button class="secondary-button" type="button" data-screen="experiment">${icon("lab")} Editar requisitos</button>
      </div>
      <div class="compat-grid">
        <div class="recommendation-list">
          ${state.recommendations
            .map(
              ({ platform, score, reasons }, index) => `
                <article class="recommendation-row">
                  <div class="rank">${index + 1}</div>
                  <div class="platform-thumb media-${platform.imageTone}">
                    <img src="assets/orbitlab-hero.png" alt="" />
                  </div>
                  <div>
                    <h3>${platform.name}</h3>
                    <p>${platform.operator} · ${platform.category}</p>
                    <div class="mini-reasons">${reasons
                      .slice(0, 3)
                      .map((reason) => `<span class="${reason.ok ? "ok" : "warn"}">${reason.label}</span>`)
                      .join("")}</div>
                  </div>
                  <div class="row-score">
                    <strong>${score}</strong>
                    <span>score</span>
                  </div>
                  <button class="primary-button small" type="button" data-action="reserve-platform" data-platform-id="${platform.id}">${icon("arrow")} Escolher</button>
                </article>
              `,
            )
            .join("")}
        </div>
        <aside class="side-panel">
          <span class="eyebrow">Resumo técnico</span>
          <h2>${state.experiment.area}</h2>
          ${spec("Duração", `${state.experiment.duration} dias`)}
          ${spec("Energia", `${state.experiment.energy} Wh`)}
          ${spec("Armazenamento", `${state.experiment.storage} GB`)}
          ${spec("Sensores", state.experiment.sensors.join(", "))}
          ${spec("Orçamento", money(state.experiment.budget))}
        </aside>
      </div>
    </section>
  `;
}

function renderCheckout() {
  const platform = selectedPlatform();
  const result = scorePlatform(platform, state.experiment);
  return `
    <section class="form-layout checkout-layout">
      <div>
        <button class="back-button" type="button" data-screen="compatibility">Compatibilidade</button>
        <div class="section-head">
          <div>
            <span class="eyebrow">Reserva</span>
            <h1>Confirmar janela experimental</h1>
          </div>
        </div>
        <form class="form-surface" data-form="checkout">
          <div class="form-row">
            <label class="field">
              <span>Data de início</span>
              <input name="startDate" type="date" value="${state.experiment.start}" required />
            </label>
            <label class="field">
              <span>Duração</span>
              <select name="duration">
                <option>${state.experiment.duration} dias</option>
                <option>${Math.max(3, state.experiment.duration - 2)} dias</option>
                <option>${Math.min(platform.duration, state.experiment.duration + 3)} dias</option>
              </select>
            </label>
          </div>
          <div class="form-row">
            <label class="field">
              <span>Faixa UTC</span>
              <select name="time">
                <option>Qualquer passagem</option>
                <option>00:00 - 06:00 UTC</option>
                <option>12:00 - 18:00 UTC</option>
              </select>
            </label>
            <label class="field">
              <span>Entrega dos dados</span>
              <select name="delivery">
                <option>Portal + API</option>
                <option>Portal</option>
                <option>API</option>
              </select>
            </label>
          </div>
          <label class="field">
            <span>Observações para a operadora</span>
            <textarea rows="4" name="notes">Validar estabilidade térmica antes da janela e enviar telemetria a cada 6 horas.</textarea>
          </label>
          <div class="form-actions">
            <button class="secondary-button" type="button" data-screen="detail">Voltar</button>
            <button class="primary-button" type="submit">${icon("save")} Confirmar reserva</button>
          </div>
        </form>
      </div>
      <aside class="side-panel">
        <span class="eyebrow">${platform.operator}</span>
        <h2>${platform.name}</h2>
        <div class="score-row large"><span>Compatibilidade</span><strong>${result.score}</strong></div>
        <div class="meter"><span style="width:${result.score}%"></span></div>
        ${spec("Preço base", money(platform.price))}
        ${spec("Taxa de plataforma", money(220))}
        ${spec("Estimativa", money(platform.price + 220))}
        <p class="muted">Sem cobrança real neste protótipo. A reserva entra como solicitação em análise.</p>
      </aside>
    </section>
  `;
}

function renderDashboard() {
  const rows =
    state.dashboardFilter === "Todos"
      ? state.reservations
      : state.reservations.filter((item) => statusLabel(item.status) === state.dashboardFilter);
  const approvedValue = state.reservations
    .filter((item) => ["approved", "scheduled", "done"].includes(item.status))
    .reduce((total, item) => total + item.value, 0);
  const avgScore = Math.round(
    state.reservations.reduce((total, item) => total + item.score, 0) / state.reservations.length,
  );
  const statuses = ["Todos", "Em análise", "Aprovado", "Agendado", "Concluído"];

  return `
    <section class="content-section">
      <div class="section-head">
        <div>
          <span class="eyebrow">Painel da instituição</span>
          <h1>Reservas e estatísticas</h1>
        </div>
        <button class="primary-button" type="button" data-screen="experiment">${icon("plus")} Nova reserva</button>
      </div>
      ${state.flash ? `<div class="flash">${icon("check")} ${state.flash}</div>` : ""}
      <div class="stats-strip four">
        ${statTile("Reservas", String(state.reservations.length))}
        ${statTile("Score médio", `${avgScore}%`)}
        ${statTile("Receita simulada", money(approvedValue))}
        ${statTile("Ocupação", "68%")}
      </div>
      <div class="dashboard-layout">
        <div class="table-area">
          <div class="toolbar">
            <div class="chips">
              ${statuses
                .map(
                  (status) =>
                    `<button class="chip ${state.dashboardFilter === status ? "is-active" : ""}" type="button" data-dashboard-filter="${status}">${status}</button>`,
                )
                .join("")}
            </div>
            <span class="muted">Ordenado por mais recentes</span>
          </div>
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Experimento</th>
                  <th>Plataforma</th>
                  <th>Início</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (row) => `
                      <tr>
                        <td>${row.id}</td>
                        <td>${row.experiment}</td>
                        <td><strong>${row.platform}</strong><small>${row.operator}</small></td>
                        <td>${row.date}</td>
                        <td>${row.score}</td>
                        <td><span class="status ${row.status}">${statusLabel(row.status)}</span></td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
        <aside class="side-panel chart-panel">
          <span class="eyebrow">Experimentos por área</span>
          ${bar("Biotecnologia", 12, 100)}
          ${bar("Materiais", 8, 67)}
          ${bar("Educação", 6, 50)}
          ${bar("Sensores", 5, 42)}
          <button class="secondary-button full" type="button" data-screen="capacity">${icon("chart")} Ver capacidade</button>
        </aside>
      </div>
    </section>
  `;
}

function bar(label, value, width) {
  return `<div class="bar-row"><span>${label}</span><strong>${value}</strong><div class="bar"><span style="width:${width}%"></span></div></div>`;
}

function renderCapacity() {
  return `
    <section class="form-layout">
      <div>
        <div class="section-head">
          <div>
            <span class="eyebrow">Operadora espacial</span>
            <h1>Cadastrar capacidade experimental</h1>
          </div>
        </div>
        <form class="form-surface" data-form="capacity">
          <div class="form-row">
            <label class="field">
              <span>Plataforma</span>
              <input name="platform" value="MicroLab Atlas" required />
            </label>
            <label class="field">
              <span>Operadora</span>
              <input name="operator" value="Orbital Edge" required />
            </label>
          </div>
          <div class="form-row">
            <label class="field">
              <span>Categoria</span>
              <select name="category">
                <option>Biotecnologia</option>
                <option>Materiais</option>
                <option>Sensores</option>
                <option>Educação</option>
              </select>
            </label>
            <label class="field">
              <span>Órbita</span>
              <input name="orbit" value="LEO 540 km" required />
            </label>
          </div>
          <div class="range-grid">
            ${rangeField("operatorEnergy", "Energia disponível", 40, 10, 90, "Wh")}
            ${rangeField("operatorStorage", "Armazenamento", 128, 24, 300, "GB")}
            ${rangeField("operatorDuration", "Duração máxima", 15, 3, 45, "dias")}
            ${rangeField("operatorPrice", "Preço", 3400, 1000, 8000, "USD", 100)}
          </div>
          <label class="field">
            <span>Sensores disponíveis</span>
            <input name="sensors" value="microgravidade, termal, câmera macro" />
          </label>
          <div class="form-actions">
            <button class="secondary-button" type="button" data-screen="dashboard">Cancelar</button>
            <button class="primary-button" type="submit">${icon("save")} Salvar capacidade</button>
          </div>
        </form>
      </div>
      <aside class="side-panel">
        <span class="eyebrow">Capacidades ativas</span>
        <h2>${platforms.length} plataformas</h2>
        <div class="capacity-list">
          ${platforms
            .slice(0, 4)
            .map(
              (platform) =>
                `<div><strong>${platform.name}</strong><span>${platform.category} · ${platform.energy} Wh · ${money(platform.price)}</span></div>`,
            )
            .join("")}
        </div>
      </aside>
    </section>
  `;
}

function statusLabel(status) {
  return (
    {
      analysis: "Em análise",
      approved: "Aprovado",
      scheduled: "Agendado",
      done: "Concluído",
    }[status] || "Em análise"
  );
}

function rankedPlatforms(experiment) {
  return platforms
    .map((platform) => ({ platform, ...scorePlatform(platform, experiment) }))
    .sort((a, b) => b.score - a.score);
}

function scorePlatform(platform, experiment) {
  const sensorMatches = experiment.sensors.filter((sensor) => platform.sensors.includes(sensor)).length;
  const checks = [
    {
      ok: platform.category === experiment.area,
      label: platform.category === experiment.area ? "Área compatível" : "Área parcial",
      value: platform.category === experiment.area ? 24 : 10,
    },
    {
      ok: platform.duration >= experiment.duration,
      label: platform.duration >= experiment.duration ? "Duração atendida" : "Duração limitada",
      value: platform.duration >= experiment.duration ? 18 : 6,
    },
    {
      ok: platform.energy >= experiment.energy,
      label: platform.energy >= experiment.energy ? "Energia suficiente" : "Energia abaixo",
      value: platform.energy >= experiment.energy ? 16 : 4,
    },
    {
      ok: platform.storage >= experiment.storage,
      label: platform.storage >= experiment.storage ? "Armazenamento ok" : "Storage parcial",
      value: platform.storage >= experiment.storage ? 14 : 4,
    },
    {
      ok: sensorMatches > 0,
      label: sensorMatches > 0 ? `${sensorMatches} sensor(es) compatíveis` : "Sensores divergentes",
      value: Math.min(18, sensorMatches * 7),
    },
    {
      ok: platform.price <= experiment.budget,
      label: platform.price <= experiment.budget ? "Dentro do orçamento" : "Acima do orçamento",
      value: platform.price <= experiment.budget ? 10 : 2,
    },
  ];
  return {
    score: Math.min(100, checks.reduce((total, item) => total + item.value, 0)),
    reasons: checks,
  };
}

function syncRangeLabels() {
  document.querySelectorAll("[data-range]").forEach((input) => {
    const label = document.querySelector(`[data-range-label="${input.dataset.range}"]`);
    if (!label) return;
    const set = () => {
      label.textContent = input.dataset.range.toLowerCase().includes("price") || input.dataset.range === "budget"
        ? money(Number(input.value))
        : `${input.value} ${rangeUnit(input.dataset.range)}`;
    };
    input.addEventListener("input", set);
    set();
  });
}

function rangeUnit(name) {
  if (name.toLowerCase().includes("energy")) return "Wh";
  if (name.toLowerCase().includes("storage")) return "GB";
  if (name.toLowerCase().includes("duration")) return "dias";
  return "";
}

document.addEventListener("click", (event) => {
  const authTab = event.target.closest("[data-auth-tab]");
  if (authTab) {
    state.authTab = authTab.dataset.authTab;
    render();
    return;
  }

  const screenButton = event.target.closest("[data-screen]");
  if (screenButton) {
    state.screen = screenButton.dataset.screen;
    state.flash = "";
    render();
    return;
  }

  const filterButton = event.target.closest("[data-filter]");
  if (filterButton) {
    state.catalogFilter = filterButton.dataset.filter;
    render();
    return;
  }

  const dashboardFilter = event.target.closest("[data-dashboard-filter]");
  if (dashboardFilter) {
    state.dashboardFilter = dashboardFilter.dataset.dashboardFilter;
    render();
    return;
  }

  const platformButton = event.target.closest("[data-platform]");
  if (platformButton) {
    state.selectedPlatformId = platformButton.dataset.platform;
    state.screen = "detail";
    render();
    return;
  }

  const action = event.target.closest("[data-action]");
  if (!action) return;

  if (action.dataset.action === "logout") {
    state.screen = "login";
    state.authTab = "login";
  }

  if (action.dataset.action === "reserve-platform") {
    state.selectedPlatformId = action.dataset.platformId;
    state.screen = "checkout";
  }

  render();
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-catalog-search]")) {
    state.catalogSearch = event.target.value;
    render();
    const input = document.querySelector("[data-catalog-search]");
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const type = form.dataset.form;

  if (type === "login" || type === "signup") {
    state.screen = "home";
    render();
    return;
  }

  if (type === "experiment") {
    const data = new FormData(form);
    state.experiment = {
      organization: data.get("organization"),
      title: data.get("title"),
      area: data.get("area"),
      duration: Number(data.get("duration")),
      energy: Number(data.get("energy")),
      storage: Number(data.get("storage")),
      budget: Number(data.get("budget")),
      start: data.get("start"),
      sensors: data.getAll("sensors"),
      objective: data.get("objective"),
    };
    state.recommendations = rankedPlatforms(state.experiment);
    state.selectedPlatformId = state.recommendations[0].platform.id;
    state.screen = "compatibility";
    render();
    return;
  }

  if (type === "checkout") {
    const platform = selectedPlatform();
    const result = scorePlatform(platform, state.experiment);
    const newReservation = {
      id: `ORB-${2300 + state.reservations.length}`,
      experiment: state.experiment.title,
      platform: platform.name,
      operator: platform.operator,
      date: new Date(`${state.experiment.start}T00:00:00`).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "analysis",
      score: result.score,
      value: platform.price,
    };
    state.reservations = [newReservation, ...state.reservations];
    state.flash = `Solicitação ${newReservation.id} enviada para análise da operadora.`;
    state.screen = "dashboard";
    render();
    return;
  }

  if (type === "capacity") {
    state.flash = "Capacidade experimental salva no painel da operadora.";
    state.screen = "dashboard";
    render();
  }
});

render();
