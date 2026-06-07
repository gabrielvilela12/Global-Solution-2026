# Solicitação de Aluguel + Calendário Custom — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fluxo completo de solicitar aluguel de satélite com seleção de período (início+fim) por um calendário custom, persistindo todos os campos no Supabase e exibindo a janela em "Meus Aluguéis".

**Architecture:** Backend Spring Boot (entidade `Solicitacao` ganha `dataFim`, `faixaHoraria`, `prioridade`; service valida; controller retorna 400 com mensagem). Frontend React: novo componente `Calendar` + `DateRangeField` (popover, range, bloqueia passado) usado no `CheckoutScreen`; `DashboardScreen` mostra a janela.

**Tech Stack:** Java 21, Spring Boot 3.3, JPA, PostgreSQL (Supabase), React 18, Tailwind CSS, Vite. Sem bibliotecas novas.

---

## Arquivos afetados

```
backend/
├── migration-solicitacoes-janela.sql                         (novo — SQL pro usuário rodar)
└── src/main/java/com/orbita/
    ├── model/Solicitacao.java                                 (modificar — campos novos)
    ├── service/SolicitacaoService.java                        (modificar — ler/validar campos)
    └── controller/SolicitacaoController.java                  (modificar — erro 400)
frontend/src/
├── components/Calendar.jsx                                    (novo — Calendar + DateRangeField)
├── api/client.js                                              (modificar — ler erro do backend)
├── screens/CheckoutScreen.jsx                                 (modificar — usar DateRangeField + novos campos)
└── screens/DashboardScreen.jsx                                (modificar — coluna "Janela")
```

**Nota sobre testes:** o projeto não tem suíte de testes automatizada (nem no backend nem no frontend). A verificação é feita por: (a) `mvn compile` / `npm run build` para garantir compilação, (b) testes manuais de API via `curl`/Invoke-RestMethod, (c) verificação no Supabase. Os passos abaixo seguem esse padrão existente em vez de TDD com framework.

**Comandos base (Windows PowerShell):**
- Maven: `& "C:\Users\Luis Gustavo\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd"` com `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"`
- Frontend roda em `http://localhost:5173`, backend em `http://localhost:8080`.

---

## FASE 1 — BANCO

### Task 1: Migração das novas colunas

**Files:**
- Create: `backend/migration-solicitacoes-janela.sql`

- [ ] **Step 1: Criar o arquivo de migração**

  `backend/migration-solicitacoes-janela.sql`:
  ```sql
  -- Janela de uso (data_fim) + campos antes decorativos (faixa_horaria, prioridade)
  ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_fim      DATE;
  ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS faixa_horaria VARCHAR(50);
  ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS prioridade    VARCHAR(30);
  ```

- [ ] **Step 2: Usuário roda no Supabase**

  Instruir o usuário a colar o SQL acima no SQL Editor do Supabase e clicar Run.
  Esperado: "Success. No rows returned".

  ⚠️ Como `ddl-auto=validate`, as colunas precisam existir antes de reiniciar o backend (Tasks 2-4).

- [ ] **Step 3: Commit**

  ```powershell
  git add backend/migration-solicitacoes-janela.sql
  git commit -m "chore: migration for solicitacao janela fields"
  ```

---

## FASE 2 — BACKEND

### Task 2: Campos novos na entidade Solicitacao

**Files:**
- Modify: `backend/src/main/java/com/orbita/model/Solicitacao.java`

- [ ] **Step 1: Substituir o conteúdo de `Solicitacao.java`**

  ```java
  package com.orbita.model;

  import jakarta.persistence.*;
  import java.time.LocalDate;
  import java.time.LocalDateTime;

  @Entity
  @Table(name = "solicitacoes")
  public class Solicitacao {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne
      @JoinColumn(name = "satelite_id")
      private Satelite satelite;

      private String objetivo;
      private LocalDate dataInicio;
      private LocalDate dataFim;
      private String duracao;

      @Column(name = "faixa_horaria")
      private String faixaHoraria;

      private String prioridade;
      private String status;
      private LocalDateTime criadoEm;

      public Solicitacao() {}

      @PrePersist
      public void prePersist() {
          if (status == null)   status   = "analise";
          if (criadoEm == null) criadoEm = LocalDateTime.now();
      }

      public Long getId()                { return id; }
      public Satelite getSatelite()      { return satelite; }
      public String getObjetivo()        { return objetivo; }
      public LocalDate getDataInicio()   { return dataInicio; }
      public LocalDate getDataFim()      { return dataFim; }
      public String getDuracao()         { return duracao; }
      public String getFaixaHoraria()    { return faixaHoraria; }
      public String getPrioridade()      { return prioridade; }
      public String getStatus()          { return status; }
      public LocalDateTime getCriadoEm() { return criadoEm; }

      public void setSatelite(Satelite satelite) { this.satelite = satelite; }
      public void setObjetivo(String objetivo)   { this.objetivo = objetivo; }
      public void setDataInicio(LocalDate d)     { this.dataInicio = d; }
      public void setDataFim(LocalDate d)        { this.dataFim = d; }
      public void setDuracao(String duracao)     { this.duracao = duracao; }
      public void setFaixaHoraria(String f)      { this.faixaHoraria = f; }
      public void setPrioridade(String p)        { this.prioridade = p; }
      public void setStatus(String status)       { this.status = status; }
  }
  ```

- [ ] **Step 2: Compilar**

  ```powershell
  $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
  cd d:\globalsolution\backend
  & "C:\Users\Luis Gustavo\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd" -q compile
  ```
  Esperado: sem saída (BUILD SUCCESS no modo quiet).

---

### Task 3: Service lê e valida os novos campos

**Files:**
- Modify: `backend/src/main/java/com/orbita/service/SolicitacaoService.java`

- [ ] **Step 1: Substituir o método `criar` (e adicionar parse de data)**

  Substituir o conteúdo de `SolicitacaoService.java` por:
  ```java
  package com.orbita.service;

  import com.orbita.model.Satelite;
  import com.orbita.model.Solicitacao;
  import com.orbita.repository.SateliteRepository;
  import com.orbita.repository.SolicitacaoRepository;
  import org.springframework.stereotype.Service;

  import java.time.LocalDate;
  import java.util.List;
  import java.util.Map;

  @Service
  public class SolicitacaoService {

      private final SolicitacaoRepository solicitacaoRepository;
      private final SateliteRepository sateliteRepository;

      public SolicitacaoService(SolicitacaoRepository solicitacaoRepository,
                                SateliteRepository sateliteRepository) {
          this.solicitacaoRepository = solicitacaoRepository;
          this.sateliteRepository    = sateliteRepository;
      }

      public List<Solicitacao> listarTodas() {
          return solicitacaoRepository.findAll();
      }

      public Solicitacao criar(Map<String, Object> body) {
          Long sateliteId = Long.valueOf(str(body.get("sateliteId")));
          Satelite satelite = sateliteRepository.findById(sateliteId)
                  .orElseThrow(() -> new IllegalArgumentException("Satélite não encontrado: " + sateliteId));

          String objetivo = str(body.get("objetivo"));
          if (objetivo.isBlank()) throw new IllegalArgumentException("Descreva o objetivo da coleta.");

          LocalDate inicio = parseData(body.get("dataInicio"));
          if (inicio == null) throw new IllegalArgumentException("Selecione a janela de uso.");

          LocalDate fim = parseData(body.get("dataFim"));
          if (fim != null && fim.isBefore(inicio))
              throw new IllegalArgumentException("A data final deve ser igual ou posterior à inicial.");

          Solicitacao s = new Solicitacao();
          s.setSatelite(satelite);
          s.setObjetivo(objetivo);
          s.setDataInicio(inicio);
          s.setDataFim(fim);
          s.setDuracao(str(body.get("duracao")));
          s.setFaixaHoraria(str(body.get("faixaHoraria")));
          s.setPrioridade(str(body.get("prioridade")));
          return solicitacaoRepository.save(s);
      }

      private static LocalDate parseData(Object o) {
          String v = str(o);
          return v.isBlank() ? null : LocalDate.parse(v);
      }

      private static String str(Object o) {
          return o == null ? "" : o.toString().trim();
      }
  }
  ```

- [ ] **Step 2: Compilar**

  ```powershell
  & "C:\Users\Luis Gustavo\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd" -q compile
  ```
  Esperado: sem saída (sucesso).

---

### Task 4: Controller retorna 400 com mensagem

**Files:**
- Modify: `backend/src/main/java/com/orbita/controller/SolicitacaoController.java`

- [ ] **Step 1: Substituir o conteúdo de `SolicitacaoController.java`**

  ```java
  package com.orbita.controller;

  import com.orbita.model.Solicitacao;
  import com.orbita.service.SolicitacaoService;
  import org.springframework.http.HttpStatus;
  import org.springframework.http.ResponseEntity;
  import org.springframework.web.bind.annotation.*;

  import java.util.List;
  import java.util.Map;

  @RestController
  @RequestMapping("/api/solicitacoes")
  public class SolicitacaoController {

      private final SolicitacaoService service;

      public SolicitacaoController(SolicitacaoService service) {
          this.service = service;
      }

      @GetMapping
      public List<Solicitacao> listar() {
          return service.listarTodas();
      }

      @PostMapping
      public ResponseEntity<?> criar(@RequestBody Map<String, Object> body) {
          try {
              Solicitacao s = service.criar(body);
              return ResponseEntity.status(HttpStatus.CREATED).body(s);
          } catch (IllegalArgumentException e) {
              return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
          }
      }
  }
  ```

- [ ] **Step 2: Reiniciar o backend** (a tabela já tem as colunas da Task 1)

  Matar o processo antigo e subir:
  ```powershell
  Get-CimInstance Win32_Process -Filter "Name = 'java.exe'" | Where-Object { $_.CommandLine -like '*orbita*' -or $_.CommandLine -like '*spring-boot*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
  $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
  cd d:\globalsolution\backend
  & "C:\Users\Luis Gustavo\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run
  ```
  (rodar em background) Esperado no log: `Started OrbitaApplication`.

- [ ] **Step 3: Testar POST com os campos novos**

  ```powershell
  curl.exe -s -X POST http://localhost:8080/api/solicitacoes -H "Content-Type: application/json" -d "{\"sateliteId\":1,\"objetivo\":\"Teste janela\",\"dataInicio\":\"2026-06-10\",\"dataFim\":\"2026-06-14\",\"duracao\":\"3 órbitas\",\"faixaHoraria\":\"06–12h\",\"prioridade\":\"Alta\"}"
  ```
  Esperado: JSON com `dataInicio`, `dataFim`, `faixaHoraria`, `prioridade` preenchidos e `status:"analise"`.

- [ ] **Step 4: Testar validação (dataFim antes de dataInicio → 400)**

  ```powershell
  curl.exe -s -X POST http://localhost:8080/api/solicitacoes -H "Content-Type: application/json" -d "{\"sateliteId\":1,\"objetivo\":\"x\",\"dataInicio\":\"2026-06-14\",\"dataFim\":\"2026-06-10\"}"
  ```
  Esperado: `{"erro":"A data final deve ser igual ou posterior à inicial."}`

- [ ] **Step 5: Commit**

  ```powershell
  git add backend/src/
  git commit -m "feat: persist janela (dataFim), faixaHoraria e prioridade na solicitacao"
  ```

---

## FASE 3 — FRONTEND: CALENDÁRIO

### Task 5: Componente Calendar + DateRangeField

**Files:**
- Create: `frontend/src/components/Calendar.jsx`

- [ ] **Step 1: Criar `frontend/src/components/Calendar.jsx`**

  ```jsx
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
  ```

- [ ] **Step 2: Verificar build**

  ```powershell
  cd d:\globalsolution\frontend
  npm run build
  ```
  Esperado: `✓ built` sem erros (o componente ainda não é usado, mas precisa compilar).

- [ ] **Step 3: Commit**

  ```powershell
  cd d:\globalsolution
  git add frontend/src/components/Calendar.jsx
  git commit -m "feat: custom range calendar component (Calendar + DateRangeField)"
  ```

---

## FASE 4 — FRONTEND: INTEGRAÇÃO

### Task 6: client.js lê a mensagem de erro do backend

**Files:**
- Modify: `frontend/src/api/client.js`

- [ ] **Step 1: Substituir a função `criarSolicitacao`**

  Localizar em `frontend/src/api/client.js`:
  ```js
  export async function criarSolicitacao(body) {
    const res = await fetch(`${BASE}/solicitacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Erro ao criar solicitação');
    return res.json();
  }
  ```
  Substituir por:
  ```js
  export async function criarSolicitacao(body) {
    const res = await fetch(`${BASE}/solicitacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.erro || 'Erro ao criar solicitação');
    return data;
  }
  ```

- [ ] **Step 2: Commit**

  ```powershell
  git add frontend/src/api/client.js
  git commit -m "feat: surface backend error message on criarSolicitacao"
  ```

---

### Task 7: CheckoutScreen usa o DateRangeField e envia os campos novos

**Files:**
- Modify: `frontend/src/screens/CheckoutScreen.jsx`

- [ ] **Step 1: Substituir o conteúdo de `CheckoutScreen.jsx`**

  ```jsx
  import { useState } from 'react'
  import { criarSolicitacao } from '../api/client.js'
  import { TopBar, Kicker, SectionTitle, Crumbs, Ph, Field, Btn, fmtData } from '../components/ui.jsx'
  import { DateRangeField } from '../components/Calendar.jsx'

  export default function CheckoutScreen({ sat, onNav, onConfirm }) {
    const [periodo, setPeriodo] = useState({ inicio: null, fim: null })
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
      if (!periodo.inicio) { setError('Selecione a janela de uso no calendário.'); return }
      if (!objetivo.trim()) { setError('Descreva o objetivo da coleta.'); return }
      setLoading(true)
      setError(null)
      try {
        const result = await criarSolicitacao({
          sateliteId: sat.id,
          objetivo,
          dataInicio: periodo.inicio,
          dataFim: periodo.fim,
          duracao,
          faixaHoraria: faixa,
          prioridade,
        })
        onConfirm(result)
      } catch (e) {
        setError(e.message)
        setLoading(false)
      }
    }

    const janelaTexto = periodo.inicio
      ? (periodo.fim ? `${fmtData(periodo.inicio)} – ${fmtData(periodo.fim)}` : fmtData(periodo.inicio))
      : '—'

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
            <div>
              <Kicker>Etapa 1 de 1 · solicitação</Kicker>
              <SectionTitle className="mb-6">Definir janela de uso</SectionTitle>

              <div className="bg-panel border border-line rounded-[14px] p-[22px] mb-[18px]">
                <h3 className="font-mono text-[12px] uppercase tracking-wider text-muted mb-4 pb-3.5 border-b border-line">Período do aluguel</h3>
                <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                  <DateRangeField label="Janela (início – fim)" value={periodo} onChange={setPeriodo} required hint="Sujeito à confirmação da operadora" />
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
                    ['Janela', janelaTexto],
                    ['Preço base', `${sat.preco} ${sat.unidade}`],
                    ['Taxa de plataforma', 'US$ 120'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-line last:border-0 text-[13px] gap-3">
                      <span className="text-muted shrink-0">{k}</span><span className="text-text text-right">{v}</span>
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
  ```

- [ ] **Step 2: Verificar build**

  ```powershell
  cd d:\globalsolution\frontend
  npm run build
  ```
  Esperado: `✓ built` sem erros.

- [ ] **Step 3: Teste manual no navegador**

  Com backend e frontend rodando: Login → Catálogo → satélite → "Solicitar uso".
  - Clicar no campo "Janela" → calendário abre
  - Dias passados aparecem cinzas e não clicáveis
  - Clicar um dia (início) e outro depois (fim) → range pintado, popover fecha
  - Resumo do pedido mostra a janela
  - Preencher objetivo → "Confirmar solicitação" → vai pro dashboard sem erro

- [ ] **Step 4: Commit**

  ```powershell
  cd d:\globalsolution
  git add frontend/src/screens/CheckoutScreen.jsx
  git commit -m "feat: checkout uses custom range calendar and sends all fields"
  ```

---

### Task 8: Dashboard exibe a janela

**Files:**
- Modify: `frontend/src/screens/DashboardScreen.jsx`

- [ ] **Step 1: Trocar o cabeçalho "Início" por "Janela"**

  Localizar em `DashboardScreen.jsx` o array de cabeçalhos:
  ```jsx
                  {['Pedido', 'Satélite', 'Objetivo da missão', 'Início', 'Duração', 'Status', ''].map(h => (
  ```
  Substituir por:
  ```jsx
                  {['Pedido', 'Satélite', 'Objetivo da missão', 'Janela', 'Duração', 'Status', ''].map(h => (
  ```

- [ ] **Step 2: Trocar a célula da data pela janela**

  Localizar a célula:
  ```jsx
                        <td className="px-4 py-3.5 font-mono text-[12px] text-muted whitespace-nowrap">{fmtData(r.dataInicio)}</td>
  ```
  Substituir por:
  ```jsx
                        <td className="px-4 py-3.5 font-mono text-[12px] text-muted whitespace-nowrap">{r.dataFim ? `${fmtData(r.dataInicio)} – ${fmtData(r.dataFim)}` : fmtData(r.dataInicio)}</td>
  ```

- [ ] **Step 3: Verificar build**

  ```powershell
  cd d:\globalsolution\frontend
  npm run build
  ```
  Esperado: `✓ built` sem erros.

- [ ] **Step 4: Teste manual ponta a ponta**

  - Criar uma solicitação nova com janela (início+fim) no checkout
  - Dashboard abre → linha no topo mostra a janela `10 jun – 14 jun 2026`, status "Em análise"
  - Conferir no Supabase:
    ```sql
    SELECT id, data_inicio, data_fim, faixa_horaria, prioridade, objetivo
    FROM solicitacoes ORDER BY criado_em DESC LIMIT 1;
    ```
    Esperado: linha com `data_fim`, `faixa_horaria` e `prioridade` preenchidos.

- [ ] **Step 5: Commit**

  ```powershell
  cd d:\globalsolution
  git add frontend/src/screens/DashboardScreen.jsx
  git commit -m "feat: dashboard shows rental window (inicio - fim)"
  ```

---

## Resumo de verificação final

1. Migração rodada no Supabase (3 colunas novas)
2. Backend: POST aceita e grava `dataFim`, `faixaHoraria`, `prioridade`; valida data e objetivo (400 com mensagem)
3. Calendário custom: range, popover, bloqueia passado, tema do app
4. Checkout: janela via calendário + envia todos os campos
5. Dashboard: coluna "Janela" com início–fim
6. Verificado no banco que os dados persistem
