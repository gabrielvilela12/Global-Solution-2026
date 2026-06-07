# Vincular Solicitação ao Usuário Logado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada solicitação passa a pertencer ao usuário que a criou; "Meus Aluguéis" mostra apenas as solicitações do usuário logado.

**Architecture:** `solicitacoes` ganha FK `usuario_id` → `usuarios` (`@ManyToOne`). O frontend (que já guarda o usuário no localStorage) envia `usuarioId` no POST e no GET (`?usuarioId=X`); o backend vincula na criação e filtra na listagem.

**Tech Stack:** Java 21, Spring Boot 3.3, JPA, PostgreSQL (Supabase), React 18, Vite. Sem libs novas.

---

## Arquivos afetados

```
backend/
├── migration-solicitacoes-usuario.sql                  (novo — SQL pro usuário rodar)
└── src/main/java/com/orbita/
    ├── model/Solicitacao.java                          (modificar — @ManyToOne Usuario)
    ├── repository/SolicitacaoRepository.java           (modificar — findByUsuarioId)
    ├── service/SolicitacaoService.java                 (modificar — vincular + listarPorUsuario)
    └── controller/SolicitacaoController.java           (modificar — GET ?usuarioId)
frontend/src/
├── App.jsx                                             (modificar — passar user às telas)
├── api/client.js                                       (modificar — getSolicitacoes(usuarioId))
├── screens/CheckoutScreen.jsx                          (modificar — enviar usuarioId)
└── screens/DashboardScreen.jsx                         (modificar — filtrar por user)
```

**Verificação:** projeto sem framework de teste. Validar via `mvn -q compile` / `npm run build`, testes de API com `curl.exe` (UTF-8), e conferência no Supabase. (Nota: o PowerShell `Invoke-RestMethod` corrompe acentos em corpo JSON — usar `curl.exe` com `--data-binary @arquivo` gravado em UTF-8 sem BOM.)

**Comandos base (PowerShell):**
- Maven: `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"` + `& "C:\Users\Luis Gustavo\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd"`
- Backend `http://localhost:8080`, frontend `http://localhost:5173`.

---

## FASE 1 — BANCO

### Task 1: Migração da coluna usuario_id

**Files:**
- Create: `backend/migration-solicitacoes-usuario.sql`

- [ ] **Step 1: Criar o arquivo**

  `backend/migration-solicitacoes-usuario.sql`:
  ```sql
  -- Vincula cada solicitação ao usuário (instituição) que a criou
  ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES usuarios(id);
  ```

- [ ] **Step 2: Usuário roda no Supabase**

  Instruir o usuário a colar o SQL no SQL Editor e clicar Run. Esperado: "Success. No rows returned".
  ⚠️ Como `ddl-auto=validate`, a coluna precisa existir antes do restart (Task 5).

- [ ] **Step 3: Commit**

  ```powershell
  git add backend/migration-solicitacoes-usuario.sql
  git commit -m "chore: migration for solicitacao usuario_id FK"
  ```

---

## FASE 2 — BACKEND (código; compila sem precisar do banco)

### Task 2: Relacionamento @ManyToOne na entidade Solicitacao

**Files:**
- Modify: `backend/src/main/java/com/orbita/model/Solicitacao.java`

- [ ] **Step 1: Substituir o conteúdo de `Solicitacao.java`**

  ```java
  package com.orbita.model;

  import com.fasterxml.jackson.annotation.JsonIgnore;
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

      @ManyToOne
      @JoinColumn(name = "usuario_id")
      @JsonIgnore
      private Usuario usuario;

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
      public Usuario getUsuario()        { return usuario; }
      public String getObjetivo()        { return objetivo; }
      public LocalDate getDataInicio()   { return dataInicio; }
      public LocalDate getDataFim()      { return dataFim; }
      public String getDuracao()         { return duracao; }
      public String getFaixaHoraria()    { return faixaHoraria; }
      public String getPrioridade()      { return prioridade; }
      public String getStatus()          { return status; }
      public LocalDateTime getCriadoEm() { return criadoEm; }

      public void setSatelite(Satelite satelite) { this.satelite = satelite; }
      public void setUsuario(Usuario usuario)    { this.usuario = usuario; }
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
  Esperado: sem saída (BUILD SUCCESS).

---

### Task 3: Repository com findByUsuarioId

**Files:**
- Modify: `backend/src/main/java/com/orbita/repository/SolicitacaoRepository.java`

- [ ] **Step 1: Substituir o conteúdo de `SolicitacaoRepository.java`**

  ```java
  package com.orbita.repository;

  import com.orbita.model.Solicitacao;
  import org.springframework.data.jpa.repository.JpaRepository;

  import java.util.List;

  public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {
      List<Solicitacao> findByUsuarioId(Long usuarioId);
  }
  ```

- [ ] **Step 2: Compilar**

  ```powershell
  & "C:\Users\Luis Gustavo\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd" -q compile
  ```
  Esperado: sem saída (sucesso).

---

### Task 4: Service vincula usuário e lista por usuário

**Files:**
- Modify: `backend/src/main/java/com/orbita/service/SolicitacaoService.java`

- [ ] **Step 1: Substituir o conteúdo de `SolicitacaoService.java`**

  ```java
  package com.orbita.service;

  import com.orbita.model.Satelite;
  import com.orbita.model.Solicitacao;
  import com.orbita.model.Usuario;
  import com.orbita.repository.SateliteRepository;
  import com.orbita.repository.SolicitacaoRepository;
  import com.orbita.repository.UsuarioRepository;
  import org.springframework.stereotype.Service;

  import java.time.LocalDate;
  import java.util.List;
  import java.util.Map;

  @Service
  public class SolicitacaoService {

      private final SolicitacaoRepository solicitacaoRepository;
      private final SateliteRepository sateliteRepository;
      private final UsuarioRepository usuarioRepository;

      public SolicitacaoService(SolicitacaoRepository solicitacaoRepository,
                                SateliteRepository sateliteRepository,
                                UsuarioRepository usuarioRepository) {
          this.solicitacaoRepository = solicitacaoRepository;
          this.sateliteRepository    = sateliteRepository;
          this.usuarioRepository      = usuarioRepository;
      }

      public List<Solicitacao> listarTodas() {
          return solicitacaoRepository.findAll();
      }

      public List<Solicitacao> listarPorUsuario(Long usuarioId) {
          return solicitacaoRepository.findByUsuarioId(usuarioId);
      }

      public Solicitacao criar(Map<String, Object> body) {
          String objetivo = str(body.get("objetivo"));
          if (objetivo.isBlank()) throw new IllegalArgumentException("Descreva o objetivo da coleta.");

          LocalDate inicio = parseData(body.get("dataInicio"));
          if (inicio == null) throw new IllegalArgumentException("Selecione a janela de uso.");

          LocalDate fim = parseData(body.get("dataFim"));
          if (fim != null && fim.isBefore(inicio))
              throw new IllegalArgumentException("A data final deve ser igual ou posterior à inicial.");

          String sateliteIdStr = str(body.get("sateliteId"));
          if (sateliteIdStr.isBlank()) throw new IllegalArgumentException("Satélite não informado.");
          Long sateliteId;
          try {
              sateliteId = Long.valueOf(sateliteIdStr);
          } catch (NumberFormatException e) {
              throw new IllegalArgumentException("Satélite inválido.");
          }
          Satelite satelite = sateliteRepository.findById(sateliteId)
                  .orElseThrow(() -> new IllegalArgumentException("Satélite não encontrado: " + sateliteId));

          String usuarioIdStr = str(body.get("usuarioId"));
          if (usuarioIdStr.isBlank()) throw new IllegalArgumentException("Usuário não identificado. Faça login novamente.");
          Long usuarioId;
          try {
              usuarioId = Long.valueOf(usuarioIdStr);
          } catch (NumberFormatException e) {
              throw new IllegalArgumentException("Usuário inválido.");
          }
          Usuario usuario = usuarioRepository.findById(usuarioId)
                  .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

          Solicitacao s = new Solicitacao();
          s.setSatelite(satelite);
          s.setUsuario(usuario);
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

### Task 5: Controller filtra por usuarioId + restart + testes de API

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
      public List<Solicitacao> listar(@RequestParam(required = false) Long usuarioId) {
          if (usuarioId != null) return service.listarPorUsuario(usuarioId);
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

- [ ] **Step 2: Reiniciar o backend** (a coluna já existe da Task 1)

  ```powershell
  Get-CimInstance Win32_Process -Filter "Name = 'java.exe'" | Where-Object { $_.CommandLine -like '*orbita*' -or $_.CommandLine -like '*spring-boot*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
  $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
  cd d:\globalsolution\backend
  & "C:\Users\Luis Gustavo\Downloads\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run
  ```
  (rodar em background) Esperado no log: `Started OrbitaApplication`.

- [ ] **Step 3: Descobrir o id do usuário demo**

  ```powershell
  $u = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"demo@universidade.edu","senha":"123456"}'
  "usuario demo id = $($u.id)"
  ```
  Anotar o id (ex.: 3). Usar como `<UID>` abaixo.

- [ ] **Step 4: POST vinculando ao usuário (via curl UTF-8)**

  ```powershell
  $uid = $u.id
  $body = "{`"sateliteId`":1,`"usuarioId`":$uid,`"objetivo`":`"Solicitacao do usuario demo`",`"dataInicio`":`"2026-06-10`",`"dataFim`":`"2026-06-14`",`"faixaHoraria`":`"06-12h`",`"prioridade`":`"Alta`"}"
  $tmp = "$env:TEMP\req_user.json"
  [System.IO.File]::WriteAllText($tmp, $body, (New-Object System.Text.UTF8Encoding($false)))
  curl.exe -s -w "`nHTTP:%{http_code}" -X POST "http://localhost:8080/api/solicitacoes" -H "Content-Type: application/json" --data-binary "@$tmp"
  ```
  Esperado: HTTP 201, JSON da solicitação criada (sem o objeto `usuario` no JSON, pois é `@JsonIgnore`).

- [ ] **Step 5: GET filtrando pelo usuário**

  ```powershell
  $mine = Invoke-RestMethod -Uri "http://localhost:8080/api/solicitacoes?usuarioId=$uid" -Method Get
  "minhas solicitacoes: $($mine.Count)"
  $all = Invoke-RestMethod -Uri "http://localhost:8080/api/solicitacoes" -Method Get
  "todas (sem filtro): $($all.Count)"
  ```
  Esperado: `minhas` ≥ 1 (a que acabou de criar) e ≤ `todas`. Um POST sem `usuarioId` deve falhar (próximo passo).

- [ ] **Step 6: POST sem usuarioId → 400**

  ```powershell
  $bad = '{"sateliteId":1,"objetivo":"sem usuario","dataInicio":"2026-06-10"}'
  $tmp = "$env:TEMP\req_bad.json"
  [System.IO.File]::WriteAllText($tmp, $bad, (New-Object System.Text.UTF8Encoding($false)))
  curl.exe -s -w "`nHTTP:%{http_code}" -X POST "http://localhost:8080/api/solicitacoes" -H "Content-Type: application/json" --data-binary "@$tmp"
  ```
  Esperado: HTTP 400, `{"erro":"Usuário não identificado. Faça login novamente."}`

- [ ] **Step 7: Commit**

  ```powershell
  cd d:\globalsolution
  git add backend/src/
  git commit -m "feat: link solicitacao to usuario (FK) and filter dashboard by user"
  ```

---

## FASE 3 — FRONTEND

### Task 6: App passa o user às telas

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Passar `user` para Checkout e Dashboard**

  Em `frontend/src/App.jsx`, localizar as duas linhas de render:
  ```jsx
    if (screen === 'checkout')  return <CheckoutScreen sat={selSat} onNav={nav} onConfirm={handleConfirm} />
    if (screen === 'dashboard') return <DashboardScreen onNav={nav} flash={flash} />
  ```
  Substituir por:
  ```jsx
    if (screen === 'checkout')  return <CheckoutScreen sat={selSat} onNav={nav} onConfirm={handleConfirm} user={user} />
    if (screen === 'dashboard') return <DashboardScreen onNav={nav} flash={flash} user={user} />
  ```

  (O estado `user` já existe em `App.jsx` — vem do login e do localStorage.)

- [ ] **Step 2: Build**

  ```powershell
  cd d:\globalsolution\frontend
  npm run build
  ```
  Esperado: `✓ built` sem erros.

- [ ] **Step 3: Commit**

  ```powershell
  cd d:\globalsolution
  git add frontend/src/App.jsx
  git commit -m "feat: pass logged-in user to checkout and dashboard"
  ```

---

### Task 7: client.js — getSolicitacoes aceita usuarioId

**Files:**
- Modify: `frontend/src/api/client.js`

- [ ] **Step 1: Substituir a função `getSolicitacoes`**

  Localizar em `frontend/src/api/client.js`:
  ```js
  export async function getSolicitacoes() {
    const res = await fetch(`${BASE}/solicitacoes`);
    if (!res.ok) throw new Error('Erro ao buscar solicitações');
    return res.json();
  }
  ```
  Substituir por:
  ```js
  export async function getSolicitacoes(usuarioId) {
    const url = usuarioId ? `${BASE}/solicitacoes?usuarioId=${usuarioId}` : `${BASE}/solicitacoes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar solicitações');
    return res.json();
  }
  ```

- [ ] **Step 2: Build + Commit**

  ```powershell
  cd d:\globalsolution\frontend; npm run build
  cd d:\globalsolution
  git add frontend/src/api/client.js
  git commit -m "feat: getSolicitacoes accepts usuarioId filter"
  ```
  Build esperado: `✓ built`.

---

### Task 8: CheckoutScreen envia usuarioId

**Files:**
- Modify: `frontend/src/screens/CheckoutScreen.jsx`

- [ ] **Step 1: Receber a prop `user`**

  Localizar a assinatura:
  ```jsx
  export default function CheckoutScreen({ sat, onNav, onConfirm }) {
  ```
  Substituir por:
  ```jsx
  export default function CheckoutScreen({ sat, onNav, onConfirm, user }) {
  ```

- [ ] **Step 2: Incluir `usuarioId` no POST**

  Localizar a chamada (dentro de `handleSubmit`):
  ```jsx
      const result = await criarSolicitacao({
        sateliteId: sat.id,
        objetivo,
        dataInicio: periodo.inicio,
        dataFim: periodo.fim,
        faixaHoraria: faixa,
        prioridade,
      })
  ```
  Substituir por:
  ```jsx
      const result = await criarSolicitacao({
        sateliteId: sat.id,
        usuarioId: user?.id,
        objetivo,
        dataInicio: periodo.inicio,
        dataFim: periodo.fim,
        faixaHoraria: faixa,
        prioridade,
      })
  ```

- [ ] **Step 3: Build + Commit**

  ```powershell
  cd d:\globalsolution\frontend; npm run build
  cd d:\globalsolution
  git add frontend/src/screens/CheckoutScreen.jsx
  git commit -m "feat: checkout sends usuarioId when creating solicitacao"
  ```
  Build esperado: `✓ built`.

---

### Task 9: DashboardScreen filtra pelo usuário logado

**Files:**
- Modify: `frontend/src/screens/DashboardScreen.jsx`

- [ ] **Step 1: Receber a prop `user`**

  Localizar:
  ```jsx
  export default function DashboardScreen({ onNav, flash }) {
  ```
  Substituir por:
  ```jsx
  export default function DashboardScreen({ onNav, flash, user }) {
  ```

- [ ] **Step 2: Buscar só as solicitações do usuário**

  Localizar o `useEffect`:
  ```jsx
    useEffect(() => {
      getSolicitacoes()
        .then(data => setRows([...data].sort((a, b) => b.id - a.id)))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }, [flash])
  ```
  Substituir por:
  ```jsx
    useEffect(() => {
      getSolicitacoes(user?.id)
        .then(data => setRows([...data].sort((a, b) => b.id - a.id)))
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }, [flash, user?.id])
  ```

- [ ] **Step 3: Build**

  ```powershell
  cd d:\globalsolution\frontend; npm run build
  ```
  Esperado: `✓ built` sem erros.

- [ ] **Step 4: Teste manual ponta a ponta (browser)**

  Com backend e frontend rodando:
  1. Login com `demo@universidade.edu` / `123456`
  2. Catálogo → satélite → "Solicitar uso" → escolher janela + objetivo → "Confirmar"
  3. Dashboard → a solicitação aparece (é do usuário demo)
  4. Sair (avatar → login), criar uma conta nova (aba "Criar conta"), logar nela
  5. Abrir "Meus Aluguéis" → deve estar **vazio** (a solicitação do demo NÃO aparece para o novo usuário)
  6. Conferir no Supabase:
     ```sql
     SELECT id, usuario_id, objetivo FROM solicitacoes ORDER BY criado_em DESC;
     ```
     Esperado: linhas com `usuario_id` preenchido.

- [ ] **Step 5: Commit**

  ```powershell
  cd d:\globalsolution
  git add frontend/src/screens/DashboardScreen.jsx
  git commit -m "feat: dashboard shows only logged-in user's solicitacoes"
  ```

---

## Resumo de verificação final

1. Migração rodada no Supabase (`usuario_id` FK)
2. Backend: POST exige e grava `usuarioId` (400 sem ele); GET `?usuarioId=` filtra
3. Frontend: App passa `user`; checkout envia `user.id`; dashboard busca só as do usuário
4. Teste com 2 usuários: cada um vê apenas as próprias solicitações
5. Confirmado no banco que `usuario_id` está preenchido
