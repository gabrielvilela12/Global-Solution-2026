# ORBITA.market — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir o backend Spring Boot conectado ao Supabase e migrar o frontend para React + Tailwind, com o fluxo solicitação → dashboard funcionando de ponta a ponta.

**Architecture:** REST API Java (Spring Boot 3 + JPA) na porta 8080 servindo 4 endpoints. Frontend React + Tailwind (Vite) na porta 5173 consome a API via fetch. Banco PostgreSQL hospedado no Supabase.

**Tech Stack:** Java 21, Spring Boot 3.3, Spring Data JPA, PostgreSQL driver, Maven, React 18, Tailwind CSS 3, Vite 5.

---

## Arquivos que serão criados

```
globalsolution/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/orbita/
│       │   ├── OrbitaApplication.java
│       │   ├── config/CorsConfig.java
│       │   ├── model/Satelite.java
│       │   ├── model/Solicitacao.java
│       │   ├── repository/SateliteRepository.java
│       │   ├── repository/SolicitacaoRepository.java
│       │   ├── service/SateliteService.java
│       │   ├── service/SolicitacaoService.java
│       │   ├── controller/SateliteController.java
│       │   └── controller/SolicitacaoController.java
│       └── resources/
│           └── application.properties
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/client.js
        ├── components/
        │   ├── TopBar.jsx
        │   ├── SatCard.jsx
        │   └── StatusPill.jsx
        └── screens/
            ├── LoginScreen.jsx
            ├── HomeScreen.jsx
            ├── DetailScreen.jsx
            ├── CheckoutScreen.jsx
            └── DashboardScreen.jsx
```

---

## FASE 1 — BANCO DE DADOS

### Task 1: Criar tabelas e seed no Supabase

**Files:**
- (executar no SQL Editor do Supabase — sem arquivo local)

- [ ] **Step 1: Criar conta e projeto no Supabase**

  Acesse https://supabase.com → New Project → anote:
  - `Project URL` (ex: `db.xxxxxxxxxxxx.supabase.co`)
  - `Database password` (definida na criação)
  - Porta: `5432`

- [ ] **Step 2: Criar tabela `satelites` no SQL Editor**

  No painel do Supabase → SQL Editor → New query → execute:

  ```sql
  CREATE TABLE satelites (
      id         BIGSERIAL PRIMARY KEY,
      nome       VARCHAR(100) NOT NULL,
      operadora  VARCHAR(100) NOT NULL,
      categoria  VARCHAR(50)  NOT NULL,
      orbita     VARCHAR(100),
      capacidade VARCHAR(200),
      resolucao  VARCHAR(50),
      revisita   VARCHAR(100),
      preco      VARCHAR(30),
      unidade    VARCHAR(30)
  );
  ```

- [ ] **Step 3: Criar tabela `solicitacoes`**

  ```sql
  CREATE TABLE solicitacoes (
      id           BIGSERIAL PRIMARY KEY,
      satelite_id  BIGINT REFERENCES satelites(id),
      objetivo     TEXT         NOT NULL,
      data_inicio  DATE,
      duracao      VARCHAR(50),
      status       VARCHAR(20)  NOT NULL DEFAULT 'analise',
      criado_em    TIMESTAMP    NOT NULL DEFAULT NOW()
  );
  ```

- [ ] **Step 4: Inserir os 6 satélites**

  ```sql
  INSERT INTO satelites (nome, operadora, categoria, orbita, capacidade, resolucao, revisita, preco, unidade) VALUES
  ('GOES-Atlas 7',  'Meteora Space',    'Clima',       'GEO · 35.786 km', 'Imageamento multiespectral · 16 bandas', '0,5 km / pixel',  'Contínuo (geoestacionário)', 'US$ 1.240', '/ órbita'),
  ('LinkSat Orion', 'Vega Networks',    'Comunicação', 'LEO · 550 km',    'Downlink banda Ka · 1,2 Gbps',           '—',               '8 passagens / dia',          'US$ 880',   '/ hora'),
  ('TerraScan 12',  'GeoOrbit Labs',    'Topografia',  'SSO · 620 km',    'Radar SAR banda-X',                       '1,0 m / pixel',   '11 dias',                    'US$ 1.560', '/ aquisição'),
  ('Helios Watch',  'Solaris Dynamics', 'Clima',       'SSO · 705 km',    'Sondagem atmosférica · IR',               '2,0 km / pixel',  '2x / dia',                   'US$ 640',   '/ órbita'),
  ('RelaySat C2',   'NovaLink',         'Comunicação', 'MEO · 8.000 km',  'Relay banda-S · baixa latência',          '—',               'Janelas de 40 min',          'US$ 1.020', '/ hora'),
  ('CartoSat HR',   'Andes Imaging',    'Topografia',  'SSO · 505 km',    'Óptico pancromático',                     '0,3 m / pixel',   '5 dias',                     'US$ 2.100', '/ aquisição');
  ```

- [ ] **Step 5: Verificar dados inseridos**

  ```sql
  SELECT * FROM satelites;
  ```

  Esperado: 6 linhas retornadas.

- [ ] **Step 6: Anotar a connection string**

  No painel Supabase → Project Settings → Database → Connection string (URI):
  ```
  jdbc:postgresql://db.XXXX.supabase.co:5432/postgres
  ```
  Guarde também o `username` (`postgres`) e a `password`.

---

## FASE 2 — BACKEND JAVA

### Task 2: Criar projeto Spring Boot

**Files:**
- Create: `backend/pom.xml`
- Create: `backend/src/main/java/com/orbita/OrbitaApplication.java`
- Create: `backend/src/main/resources/application.properties`

- [ ] **Step 1: Criar estrutura de pastas**

  No terminal, dentro de `d:\globalsolution`:
  ```powershell
  mkdir backend\src\main\java\com\orbita\config
  mkdir backend\src\main\java\com\orbita\model
  mkdir backend\src\main\java\com\orbita\repository
  mkdir backend\src\main\java\com\orbita\service
  mkdir backend\src\main\java\com\orbita\controller
  mkdir backend\src\main\resources
  ```

- [ ] **Step 2: Criar `backend/pom.xml`**

  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <project xmlns="http://maven.apache.org/POM/4.0.0"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                               https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-parent</artifactId>
      <version>3.3.0</version>
    </parent>

    <groupId>com.orbita</groupId>
    <artifactId>orbita-backend</artifactId>
    <version>1.0.0</version>
    <name>orbita-backend</name>

    <properties>
      <java.version>21</java.version>
    </properties>

    <dependencies>
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
      </dependency>
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
      </dependency>
      <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
      </dependency>
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
      </dependency>
    </dependencies>

    <build>
      <plugins>
        <plugin>
          <groupId>org.springframework.boot</groupId>
          <artifactId>spring-boot-maven-plugin</artifactId>
        </plugin>
      </plugins>
    </build>
  </project>
  ```

- [ ] **Step 3: Criar `backend/src/main/java/com/orbita/OrbitaApplication.java`**

  ```java
  package com.orbita;

  import org.springframework.boot.SpringApplication;
  import org.springframework.boot.autoconfigure.SpringBootApplication;

  @SpringBootApplication
  public class OrbitaApplication {
      public static void main(String[] args) {
          SpringApplication.run(OrbitaApplication.class, args);
      }
  }
  ```

- [ ] **Step 4: Criar `backend/src/main/resources/application.properties`**

  Substitua `SEU_HOST`, `SUA_SENHA` pelos valores anotados no Task 1:

  ```properties
  spring.datasource.url=jdbc:postgresql://SEU_HOST:5432/postgres
  spring.datasource.username=postgres
  spring.datasource.password=SUA_SENHA
  spring.datasource.driver-class-name=org.postgresql.Driver

  spring.jpa.hibernate.ddl-auto=validate
  spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
  spring.jpa.show-sql=true

  server.port=8080
  ```

- [ ] **Step 5: Verificar que o projeto compila**

  ```powershell
  cd backend
  mvn compile
  ```

  Esperado: `BUILD SUCCESS`

- [ ] **Step 6: Commit**

  ```powershell
  cd ..
  git add backend/
  git commit -m "feat: scaffold spring boot project"
  ```

---

### Task 3: Entidade Satelite

**Files:**
- Create: `backend/src/main/java/com/orbita/model/Satelite.java`
- Create: `backend/src/main/java/com/orbita/repository/SateliteRepository.java`

- [ ] **Step 1: Criar `model/Satelite.java`**

  ```java
  package com.orbita.model;

  import jakarta.persistence.*;

  @Entity
  @Table(name = "satelites")
  public class Satelite {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      private String nome;
      private String operadora;
      private String categoria;
      private String orbita;
      private String capacidade;
      private String resolucao;
      private String revisita;
      private String preco;
      private String unidade;

      public Satelite() {}

      public Long getId()          { return id; }
      public String getNome()      { return nome; }
      public String getOperadora() { return operadora; }
      public String getCategoria() { return categoria; }
      public String getOrbita()    { return orbita; }
      public String getCapacidade(){ return capacidade; }
      public String getResolucao() { return resolucao; }
      public String getRevisita()  { return revisita; }
      public String getPreco()     { return preco; }
      public String getUnidade()   { return unidade; }
  }
  ```

- [ ] **Step 2: Criar `repository/SateliteRepository.java`**

  ```java
  package com.orbita.repository;

  import com.orbita.model.Satelite;
  import org.springframework.data.jpa.repository.JpaRepository;

  public interface SateliteRepository extends JpaRepository<Satelite, Long> {
  }
  ```

- [ ] **Step 3: Compilar para verificar**

  ```powershell
  mvn compile
  ```

  Esperado: `BUILD SUCCESS`

---

### Task 4: SateliteService e SateliteController

**Files:**
- Create: `backend/src/main/java/com/orbita/service/SateliteService.java`
- Create: `backend/src/main/java/com/orbita/controller/SateliteController.java`

- [ ] **Step 1: Criar `service/SateliteService.java`**

  ```java
  package com.orbita.service;

  import com.orbita.model.Satelite;
  import com.orbita.repository.SateliteRepository;
  import org.springframework.stereotype.Service;

  import java.util.List;
  import java.util.Optional;

  @Service
  public class SateliteService {

      private final SateliteRepository repository;

      public SateliteService(SateliteRepository repository) {
          this.repository = repository;
      }

      public List<Satelite> listarTodos() {
          return repository.findAll();
      }

      public Optional<Satelite> buscarPorId(Long id) {
          return repository.findById(id);
      }
  }
  ```

- [ ] **Step 2: Criar `controller/SateliteController.java`**

  ```java
  package com.orbita.controller;

  import com.orbita.model.Satelite;
  import com.orbita.service.SateliteService;
  import org.springframework.http.ResponseEntity;
  import org.springframework.web.bind.annotation.*;

  import java.util.List;

  @RestController
  @RequestMapping("/api/satelites")
  public class SateliteController {

      private final SateliteService service;

      public SateliteController(SateliteService service) {
          this.service = service;
      }

      @GetMapping
      public List<Satelite> listar() {
          return service.listarTodos();
      }

      @GetMapping("/{id}")
      public ResponseEntity<Satelite> buscar(@PathVariable Long id) {
          return service.buscarPorId(id)
                  .map(ResponseEntity::ok)
                  .orElse(ResponseEntity.notFound().build());
      }
  }
  ```

- [ ] **Step 3: Subir o servidor e testar**

  ```powershell
  mvn spring-boot:run
  ```

  Em outro terminal:
  ```powershell
  curl http://localhost:8080/api/satelites
  ```

  Esperado: JSON array com os 6 satélites do banco.

- [ ] **Step 4: Parar o servidor e commit**

  ```powershell
  git add backend/src/
  git commit -m "feat: satelite entity, repository, service and controller"
  ```

---

### Task 5: Entidade Solicitacao

**Files:**
- Create: `backend/src/main/java/com/orbita/model/Solicitacao.java`
- Create: `backend/src/main/java/com/orbita/repository/SolicitacaoRepository.java`

- [ ] **Step 1: Criar `model/Solicitacao.java`**

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
      private String duracao;
      private String status;
      private LocalDateTime criadoEm;

      public Solicitacao() {}

      @PrePersist
      public void prePersist() {
          if (status == null)    status    = "analise";
          if (criadoEm == null)  criadoEm  = LocalDateTime.now();
      }

      public Long getId()              { return id; }
      public Satelite getSatelite()    { return satelite; }
      public String getObjetivo()      { return objetivo; }
      public LocalDate getDataInicio() { return dataInicio; }
      public String getDuracao()       { return duracao; }
      public String getStatus()        { return status; }
      public LocalDateTime getCriadoEm() { return criadoEm; }

      public void setSatelite(Satelite satelite)    { this.satelite = satelite; }
      public void setObjetivo(String objetivo)      { this.objetivo = objetivo; }
      public void setDataInicio(LocalDate d)        { this.dataInicio = d; }
      public void setDuracao(String duracao)        { this.duracao = duracao; }
      public void setStatus(String status)          { this.status = status; }
  }
  ```

- [ ] **Step 2: Criar `repository/SolicitacaoRepository.java`**

  ```java
  package com.orbita.repository;

  import com.orbita.model.Solicitacao;
  import org.springframework.data.jpa.repository.JpaRepository;

  public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {
  }
  ```

- [ ] **Step 3: Compilar**

  ```powershell
  mvn compile
  ```

  Esperado: `BUILD SUCCESS`

---

### Task 6: SolicitacaoService e SolicitacaoController

**Files:**
- Create: `backend/src/main/java/com/orbita/service/SolicitacaoService.java`
- Create: `backend/src/main/java/com/orbita/controller/SolicitacaoController.java`

- [ ] **Step 1: Criar `service/SolicitacaoService.java`**

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
          Long sateliteId = Long.valueOf(body.get("sateliteId").toString());
          Satelite satelite = sateliteRepository.findById(sateliteId)
                  .orElseThrow(() -> new RuntimeException("Satélite não encontrado: " + sateliteId));

          Solicitacao s = new Solicitacao();
          s.setSatelite(satelite);
          s.setObjetivo(body.get("objetivo").toString());
          s.setDuracao(body.getOrDefault("duracao", "").toString());

          Object dataObj = body.get("dataInicio");
          if (dataObj != null && !dataObj.toString().isBlank()) {
              s.setDataInicio(LocalDate.parse(dataObj.toString()));
          }

          return solicitacaoRepository.save(s);
      }
  }
  ```

- [ ] **Step 2: Criar `controller/SolicitacaoController.java`**

  ```java
  package com.orbita.controller;

  import com.orbita.model.Solicitacao;
  import com.orbita.service.SolicitacaoService;
  import org.springframework.http.HttpStatus;
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
      @ResponseStatus(HttpStatus.CREATED)
      public Solicitacao criar(@RequestBody Map<String, Object> body) {
          return service.criar(body);
      }
  }
  ```

- [ ] **Step 3: Subir e testar GET**

  ```powershell
  mvn spring-boot:run
  ```

  ```powershell
  curl http://localhost:8080/api/solicitacoes
  ```

  Esperado: `[]` (lista vazia — nenhuma solicitação ainda).

- [ ] **Step 4: Testar POST**

  ```powershell
  curl -X POST http://localhost:8080/api/solicitacoes `
    -H "Content-Type: application/json" `
    -d '{"sateliteId":1,"objetivo":"Teste de integração","duracao":"2 orbitas","dataInicio":"2026-06-12"}'
  ```

  Esperado: JSON da solicitação criada com `"status":"analise"` e `"id"` preenchido.

- [ ] **Step 5: Confirmar no banco**

  No Supabase SQL Editor:
  ```sql
  SELECT * FROM solicitacoes;
  ```
  Esperado: 1 linha com os dados do POST.

- [ ] **Step 6: Parar servidor e commit**

  ```powershell
  git add backend/src/
  git commit -m "feat: solicitacao entity, service and controller"
  ```

---

### Task 7: Configurar CORS

**Files:**
- Create: `backend/src/main/java/com/orbita/config/CorsConfig.java`

- [ ] **Step 1: Criar `config/CorsConfig.java`**

  ```java
  package com.orbita.config;

  import org.springframework.context.annotation.Configuration;
  import org.springframework.web.servlet.config.annotation.CorsRegistry;
  import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

  @Configuration
  public class CorsConfig implements WebMvcConfigurer {

      @Override
      public void addCorsMappings(CorsRegistry registry) {
          registry.addMapping("/api/**")
                  .allowedOrigins("http://localhost:5173")
                  .allowedMethods("GET", "POST", "PUT", "DELETE")
                  .allowedHeaders("*");
      }
  }
  ```

- [ ] **Step 2: Reiniciar e verificar**

  ```powershell
  mvn spring-boot:run
  ```

  Abrir `http://localhost:8080/api/satelites` no browser — deve retornar JSON sem erros CORS.

- [ ] **Step 3: Commit**

  ```powershell
  git add backend/src/main/java/com/orbita/config/
  git commit -m "feat: configure CORS for localhost:5173"
  ```

---

## FASE 3 — FRONTEND REACT + TAILWIND

### Task 8: Criar projeto Vite + React + Tailwind

**Files:**
- Create: `frontend/` (projeto Vite completo)
- Create: `frontend/src/api/client.js`

- [ ] **Step 1: Criar projeto Vite**

  ```powershell
  cd d:\globalsolution
  npm create vite@latest frontend -- --template react
  cd frontend
  npm install
  ```

- [ ] **Step 2: Instalar Tailwind CSS**

  ```powershell
  npm install -D tailwindcss@3 postcss autoprefixer
  npx tailwindcss init -p
  ```

- [ ] **Step 3: Configurar `tailwind.config.js`**

  ```js
  /** @type {import('tailwindcss').Config} */
  export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
      extend: {
        colors: {
          bg:      '#050c18',
          bg2:     '#07101f',
          panel:   '#0c1a2e',
          panel2:  '#112240',
          accent:  '#22d3f8',
          muted:   '#8aabcc',
          dim:     '#4a6a8a',
        },
        fontFamily: {
          display: ['Syne', 'sans-serif'],
          mono:    ['JetBrains Mono', 'monospace'],
        },
      },
    },
    plugins: [],
  }
  ```

- [ ] **Step 4: Substituir `src/index.css`**

  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  body {
    background-color: #050c18;
    color: #cdd9f5;
    font-family: 'DM Sans', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  ```

- [ ] **Step 5: Criar `src/api/client.js`**

  ```js
  const BASE = 'http://localhost:8080/api';

  export async function getSatelites() {
    const res = await fetch(`${BASE}/satelites`);
    if (!res.ok) throw new Error('Erro ao buscar satélites');
    return res.json();
  }

  export async function getSatelite(id) {
    const res = await fetch(`${BASE}/satelites/${id}`);
    if (!res.ok) throw new Error('Satélite não encontrado');
    return res.json();
  }

  export async function getSolicitacoes() {
    const res = await fetch(`${BASE}/solicitacoes`);
    if (!res.ok) throw new Error('Erro ao buscar solicitações');
    return res.json();
  }

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

- [ ] **Step 6: Verificar que o frontend sobe**

  ```powershell
  npm run dev
  ```

  Esperado: `Local: http://localhost:5173/` no terminal.

- [ ] **Step 7: Commit**

  ```powershell
  cd ..
  git add frontend/
  git commit -m "feat: scaffold react + tailwind frontend with api client"
  ```

---

### Task 9: App.jsx e roteamento entre telas

**Files:**
- Modify: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`

- [ ] **Step 1: Atualizar `src/main.jsx`**

  ```jsx
  import { StrictMode } from 'react'
  import { createRoot } from 'react-dom/client'
  import './index.css'
  import App from './App.jsx'

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
  ```

- [ ] **Step 2: Criar `src/App.jsx`**

  ```jsx
  import { useState } from 'react'
  import LoginScreen    from './screens/LoginScreen.jsx'
  import HomeScreen     from './screens/HomeScreen.jsx'
  import DetailScreen   from './screens/DetailScreen.jsx'
  import CheckoutScreen from './screens/CheckoutScreen.jsx'
  import DashboardScreen from './screens/DashboardScreen.jsx'

  export default function App() {
    const [screen,  setScreen]  = useState('login')
    const [selSat,  setSelSat]  = useState(null)
    const [flash,   setFlash]   = useState(null)

    const go = (s) => { setScreen(s); window.scrollTo({ top: 0 }) }

    const handleLogin   = () => go('home')
    const handleOpen    = (sat) => { setSelSat(sat); go('details') }
    const handleRequest = (sat) => { setSelSat(sat); go('checkout') }
    const handleConfirm = (solicitacao) => { setFlash(solicitacao); go('dashboard') }
    const nav = (s) => { if (s === 'login') setFlash(null); go(s) }

    if (screen === 'login')     return <LoginScreen    onLogin={handleLogin} />
    if (screen === 'home')      return <HomeScreen     onNav={nav} onOpen={handleOpen} />
    if (screen === 'details')   return <DetailScreen   sat={selSat} onNav={nav} onRequest={handleRequest} />
    if (screen === 'checkout')  return <CheckoutScreen sat={selSat} onNav={nav} onConfirm={handleConfirm} />
    if (screen === 'dashboard') return <DashboardScreen onNav={nav} flash={flash} />
    return null
  }
  ```

- [ ] **Step 3: Criar `src/screens/LoginScreen.jsx` (tela estática)**

  ```jsx
  export default function LoginScreen({ onLogin }) {
    return (
      <div className="min-h-screen flex flex-col bg-bg">
        <header className="border-b border-white/5 px-6 py-4 flex items-center gap-3">
          <span className="text-accent font-display font-bold text-lg">◍ ORBITA<span className="text-accent">.market</span></span>
        </header>
        <div className="flex flex-1">
          <aside className="hidden lg:flex flex-1 bg-panel border-r border-white/5 items-end p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">Space Economy · B2C</p>
              <h1 className="font-display font-extrabold text-3xl text-white leading-tight mb-3">
                Tempo de satélite sob demanda para pesquisa.
              </h1>
              <p className="text-muted text-sm leading-relaxed">
                Reserve janelas de observação de clima, comunicação e topografia direto com as operadoras.
              </p>
            </div>
          </aside>
          <section className="flex flex-1 items-center justify-center p-8 bg-bg2">
            <div className="w-full max-w-sm">
              <div className="flex bg-panel border border-white/5 rounded-md p-1 mb-6">
                <button className="flex-1 py-2 rounded text-sm font-medium bg-panel2 text-white">Entrar</button>
                <button className="flex-1 py-2 rounded text-sm font-medium text-muted">Criar conta</button>
              </div>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">E-mail institucional *</span>
                  <div className="h-10 bg-panel border border-white/10 rounded-md px-3 flex items-center text-dim text-sm">nome@universidade.edu</div>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Senha *</span>
                  <div className="h-10 bg-panel border border-white/10 rounded-md px-3 flex items-center text-dim text-sm">••••••••</div>
                </label>
                <button onClick={onLogin}
                  className="w-full h-10 bg-accent text-bg font-semibold rounded-md text-sm hover:bg-cyan-300 transition-colors">
                  Entrar na plataforma
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 4: Verificar no browser**

  Com `npm run dev` rodando, abrir `http://localhost:5173` — deve exibir a tela de login.

- [ ] **Step 5: Commit**

  ```powershell
  git add frontend/src/
  git commit -m "feat: app router and login screen"
  ```

---

### Task 10: HomeScreen — catálogo com dados reais do banco

**Files:**
- Create: `frontend/src/screens/HomeScreen.jsx`

- [ ] **Step 1: Criar `src/screens/HomeScreen.jsx`**

  ```jsx
  import { useEffect, useState } from 'react'
  import { getSatelites } from '../api/client.js'

  const CAT_COLOR = {
    'Clima':       'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    'Comunicação': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'Topografia':  'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  }

  export default function HomeScreen({ onNav, onOpen }) {
    const [sats,   setSats]   = useState([])
    const [filter, setFilter] = useState('Todos')
    const [loading, setLoading] = useState(true)
    const [error,  setError]  = useState(null)

    useEffect(() => {
      getSatelites()
        .then(setSats)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }, [])

    const cats   = ['Todos', 'Clima', 'Comunicação', 'Topografia']
    const listed = filter === 'Todos' ? sats : sats.filter(s => s.categoria === filter)

    return (
      <div className="min-h-screen bg-bg">
        {/* TopBar */}
        <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-white/5 px-6">
          <div className="max-w-6xl mx-auto flex items-center gap-6 h-14">
            <button onClick={() => onNav('home')} className="font-display font-bold text-white text-lg">
              ◍ ORBITA<span className="text-accent">.market</span>
            </button>
            <nav className="flex gap-1 flex-1">
              <button className="px-3 py-1.5 rounded text-sm font-medium text-white bg-accent/10">Catálogo</button>
              <button onClick={() => onNav('dashboard')} className="px-3 py-1.5 rounded text-sm font-medium text-muted hover:text-white transition-colors">Meus Aluguéis</button>
            </nav>
          </div>
        </header>

        {/* Hero search */}
        <div className="bg-gradient-to-b from-panel to-transparent border-b border-white/5 py-8">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Catálogo · {sats.length} satélites disponíveis</p>
            <h2 className="font-display font-bold text-2xl text-white mb-4">Encontre tempo orbital sob demanda</h2>
            <div className="flex items-center gap-3 bg-panel2 border border-white/10 rounded-lg px-4 py-3 hover:border-accent/30 transition-colors">
              <span className="text-dim text-lg">⌕</span>
              <span className="flex-1 text-dim text-sm">Buscar por satélite, operadora, sensor ou região…</span>
              <button className="px-3 py-1 bg-accent text-bg text-xs font-semibold rounded">Buscar</button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-7">
          {/* Filtros */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider text-dim">Filtrar</span>
            {cats.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={`px-4 h-8 rounded-full text-sm font-medium border transition-colors
                  ${filter === c
                    ? 'bg-accent/10 border-accent text-accent'
                    : 'bg-panel border-white/10 text-muted hover:border-accent/40'}`}>
                {c}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading && <p className="text-muted text-sm">Carregando satélites…</p>}
          {error   && <p className="text-red-400 text-sm">Erro: {error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listed.map(s => (
              <button key={s.id} onClick={() => onOpen(s)} className="text-left bg-panel border border-white/5 rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-white/10 hover:shadow-2xl transition-all">
                <div className="h-36 bg-panel2 flex items-center justify-center border-b border-white/5 relative">
                  <span className="text-3xl opacity-30">◍</span>
                  <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full border ${CAT_COLOR[s.categoria] || 'text-muted'}`}>
                    {s.categoria}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <h3 className="font-display font-bold text-white">{s.nome}</h3>
                  <p className="text-xs text-muted">{s.operadora}</p>
                  <p className="text-xs text-dim">{s.orbita} · {s.resolucao !== '—' ? s.resolucao : s.capacidade?.split(' · ')[0]}</p>
                  <div className="flex items-baseline justify-between mt-2 pt-3 border-t border-white/5">
                    <span className="font-display font-bold text-white">{s.preco}<small className="font-sans font-normal text-dim text-xs ml-1">{s.unidade}</small></span>
                    <span className="text-accent text-xs font-semibold">Ver detalhes →</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 2: Verificar catálogo carregando do banco**

  Com backend e frontend rodando:
  - Abrir `http://localhost:5173`
  - Fazer login → catálogo deve exibir os 6 satélites vindos do Supabase.

- [ ] **Step 3: Commit**

  ```powershell
  git add frontend/src/screens/HomeScreen.jsx
  git commit -m "feat: home screen with real data from API"
  ```

---

### Task 11: DetailScreen e CheckoutScreen — POST ao banco

**Files:**
- Create: `frontend/src/screens/DetailScreen.jsx`
- Create: `frontend/src/screens/CheckoutScreen.jsx`

- [ ] **Step 1: Criar `src/screens/DetailScreen.jsx`**

  ```jsx
  export default function DetailScreen({ sat, onNav, onRequest }) {
    if (!sat) return null
    const specs = [
      ['Capacidade', sat.capacidade],
      ['Órbita',     sat.orbita],
      ['Resolução',  sat.resolucao],
      ['Revisita',   sat.revisita],
      ['Operadora',  sat.operadora],
      ['Categoria',  sat.categoria],
    ]
    return (
      <div className="min-h-screen bg-bg">
        <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-white/5 px-6">
          <div className="max-w-6xl mx-auto flex items-center gap-6 h-14">
            <button onClick={() => onNav('home')} className="font-display font-bold text-white text-lg">◍ ORBITA<span className="text-accent">.market</span></button>
            <nav className="flex gap-1">
              <button onClick={() => onNav('home')} className="px-3 py-1.5 rounded text-sm font-medium text-muted hover:text-white">Catálogo</button>
              <button onClick={() => onNav('dashboard')} className="px-3 py-1.5 rounded text-sm font-medium text-muted hover:text-white">Meus Aluguéis</button>
            </nav>
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-6 py-7">
          <nav className="flex items-center gap-2 text-xs text-dim mb-6">
            <button onClick={() => onNav('home')} className="text-muted hover:text-accent">Catálogo</button>
            <span>/</span>
            <span className="text-white">{sat.nome}</span>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            <div>
              <div className="h-72 bg-panel border border-white/5 rounded-xl flex items-center justify-center mb-3">
                <span className="text-6xl opacity-20">◍</span>
              </div>
              <h2 className="font-display font-bold text-xl text-white mb-4 mt-6">Especificações</h2>
              <div className="border border-white/5 rounded-xl overflow-hidden mb-6">
                {specs.map(([k, v], i) => (
                  <div key={k} className={`grid grid-cols-[150px_1fr] gap-4 px-4 py-3 border-b border-white/5 last:border-0 ${i % 2 === 1 ? 'bg-panel' : ''}`}>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted self-center">{k}</span>
                    <span className="text-sm text-white self-center">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <aside className="lg:sticky lg:top-20 self-start">
              <div className="bg-panel border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-accent">{sat.categoria}</p>
                <h1 className="font-display font-bold text-xl text-white leading-tight">{sat.nome}</h1>
                <p className="text-sm text-muted">{sat.operadora}</p>
                <div className="bg-panel2 border border-white/5 rounded-xl p-4 flex items-baseline gap-2">
                  <span className="text-xs text-dim">a partir de</span>
                  <span className="font-display font-extrabold text-2xl text-white">{sat.preco}</span>
                  <span className="text-xs text-dim">{sat.unidade}</span>
                </div>
                <button onClick={() => onRequest(sat)}
                  className="w-full h-10 bg-accent text-bg font-semibold text-sm rounded-lg hover:bg-cyan-300 transition-colors">
                  Solicitar uso →
                </button>
                <button className="w-full h-10 border border-white/10 text-muted text-sm rounded-lg hover:border-accent/40 hover:text-accent transition-colors">
                  Falar com a operadora
                </button>
                <p className="text-xs text-dim text-center">Sem cobrança até a confirmação da janela pela operadora.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 2: Criar `src/screens/CheckoutScreen.jsx`**

  ```jsx
  import { useState } from 'react'
  import { criarSolicitacao } from '../api/client.js'

  export default function CheckoutScreen({ sat, onNav, onConfirm }) {
    const [objetivo,    setObjetivo]   = useState('')
    const [dataInicio,  setDataInicio] = useState('')
    const [duracao,     setDuracao]    = useState('')
    const [loading,     setLoading]    = useState(false)
    const [error,       setError]      = useState(null)

    if (!sat) return null

    const handleSubmit = async () => {
      if (!objetivo.trim()) { setError('Descreva o objetivo da coleta.'); return }
      setLoading(true)
      setError(null)
      try {
        const result = await criarSolicitacao({ sateliteId: sat.id, objetivo, dataInicio, duracao })
        onConfirm(result)
      } catch (e) {
        setError(e.message)
        setLoading(false)
      }
    }

    return (
      <div className="min-h-screen bg-bg">
        <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-white/5 px-6">
          <div className="max-w-6xl mx-auto flex items-center gap-6 h-14">
            <button onClick={() => onNav('home')} className="font-display font-bold text-white text-lg">◍ ORBITA<span className="text-accent">.market</span></button>
          </div>
        </header>
        <div className="max-w-6xl mx-auto px-6 py-7">
          <nav className="flex items-center gap-2 text-xs text-dim mb-6">
            <button onClick={() => onNav('home')} className="text-muted hover:text-accent">Catálogo</button>
            <span>/</span>
            <button onClick={() => onNav('details')} className="text-muted hover:text-accent">{sat.nome}</button>
            <span>/</span>
            <span className="text-white">Solicitação</span>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Etapa 1 de 1</p>
              <h2 className="font-display font-bold text-xl text-white mb-6">Definir janela de uso</h2>

              <div className="bg-panel border border-white/5 rounded-2xl p-6 mb-5">
                <h3 className="font-display font-semibold text-base text-white mb-4 pb-3 border-b border-white/5">Período do aluguel</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">Data de início</span>
                    <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
                      className="h-10 bg-bg border border-white/10 rounded-md px-3 text-white text-sm focus:border-accent outline-none" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">Duração</span>
                    <input type="text" placeholder={`ex: 3 ${sat.unidade?.replace('/ ','')}`} value={duracao} onChange={e => setDuracao(e.target.value)}
                      className="h-10 bg-bg border border-white/10 rounded-md px-3 text-white text-sm placeholder:text-dim focus:border-accent outline-none" />
                  </label>
                </div>
              </div>

              <div className="bg-panel border border-white/5 rounded-2xl p-6 mb-5">
                <h3 className="font-display font-semibold text-base text-white mb-4 pb-3 border-b border-white/5">Objetivo da missão</h3>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">Descreva o objetivo da coleta *</span>
                  <textarea rows={4} value={objetivo} onChange={e => setObjetivo(e.target.value)}
                    placeholder="Ex.: monitorar cobertura de nuvens sobre a Amazônia…"
                    className="bg-bg border border-white/10 rounded-md px-3 py-2.5 text-white text-sm placeholder:text-dim focus:border-accent outline-none resize-none" />
                  <span className="text-xs text-dim">Ajuda a operadora a configurar o sensor e validar o uso.</span>
                </label>
              </div>

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <div className="flex justify-between">
                <button onClick={() => onNav('details')} className="px-5 h-10 border border-white/10 text-muted text-sm rounded-lg hover:border-accent/40 hover:text-accent transition-colors">← Voltar</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="px-6 h-10 bg-accent text-bg font-semibold text-sm rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-50">
                  {loading ? 'Enviando…' : 'Confirmar solicitação'}
                </button>
              </div>
            </div>

            <aside>
              <div className="bg-panel border border-white/10 rounded-2xl p-5 sticky top-20">
                <div className="flex gap-3 items-center mb-4 pb-4 border-b border-white/5">
                  <div className="w-14 h-14 bg-panel2 border border-white/5 rounded-lg flex items-center justify-center text-xl opacity-30">◍</div>
                  <div>
                    <p className="font-display font-bold text-sm text-white">{sat.nome}</p>
                    <p className="text-xs text-muted">{sat.operadora}</p>
                  </div>
                </div>
                <div className="flex flex-col">
                  {[['Categoria', sat.categoria], ['Órbita', sat.orbita?.split(' · ')[0]], ['Preço base', `${sat.preco} ${sat.unidade}`], ['Taxa de plataforma', 'US$ 120']].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                      <span className="text-muted">{k}</span><span className="text-white">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 mt-1 border-t border-white/10 font-semibold">
                  <span className="text-sm">Estimativa</span>
                  <span className="font-display font-extrabold text-xl text-white">US$ 1.360</span>
                </div>
                <p className="text-xs text-dim mt-2">Valor final confirmado após aprovação da operadora.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 3: Testar o fluxo completo**

  - Abrir `http://localhost:5173`
  - Login → selecionar satélite → "Solicitar uso" → preencher objetivo → "Confirmar solicitação"
  - Verificar que não há erro no console.

- [ ] **Step 4: Confirmar no banco que o POST foi salvo**

  No Supabase SQL Editor:
  ```sql
  SELECT s.id, sa.nome, s.objetivo, s.status, s.criado_em
  FROM solicitacoes s JOIN satelites sa ON s.satelite_id = sa.id
  ORDER BY s.criado_em DESC;
  ```
  Esperado: linha com o objetivo digitado e `status = 'analise'`.

- [ ] **Step 5: Commit**

  ```powershell
  git add frontend/src/screens/DetailScreen.jsx frontend/src/screens/CheckoutScreen.jsx
  git commit -m "feat: detail and checkout screens with POST to backend"
  ```

---

### Task 12: DashboardScreen — GET solicitações do banco

**Files:**
- Create: `frontend/src/screens/DashboardScreen.jsx`

- [ ] **Step 1: Criar `src/screens/DashboardScreen.jsx`**

  ```jsx
  import { useEffect, useState } from 'react'
  import { getSolicitacoes } from '../api/client.js'

  const STATUS = {
    analise:   { label: 'Em análise', cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' },
    aprovado:  { label: 'Aprovado',   cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
    agendado:  { label: 'Agendado',   cls: 'bg-blue-400/10 text-blue-400 border-blue-400/20' },
    concluido: { label: 'Concluído',  cls: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
    recusado:  { label: 'Recusado',   cls: 'bg-red-400/10 text-red-400 border-red-400/20' },
  }

  export default function DashboardScreen({ onNav, flash }) {
    const [rows,    setRows]    = useState([])
    const [loading, setLoading] = useState(true)
    const [error,   setError]   = useState(null)

    useEffect(() => {
      getSolicitacoes()
        .then(setRows)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false))
    }, [flash])

    const stats = [
      ['Em análise',  rows.filter(r => r.status === 'analise').length],
      ['Aprovados',   rows.filter(r => r.status === 'aprovado').length],
      ['Agendados',   rows.filter(r => r.status === 'agendado').length],
      ['Concluídos',  rows.filter(r => r.status === 'concluido').length],
    ]

    return (
      <div className="min-h-screen bg-bg">
        <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur border-b border-white/5 px-6">
          <div className="max-w-6xl mx-auto flex items-center gap-6 h-14">
            <button onClick={() => onNav('home')} className="font-display font-bold text-white text-lg">◍ ORBITA<span className="text-accent">.market</span></button>
            <nav className="flex gap-1">
              <button onClick={() => onNav('home')} className="px-3 py-1.5 rounded text-sm font-medium text-muted hover:text-white">Catálogo</button>
              <button className="px-3 py-1.5 rounded text-sm font-medium text-white bg-accent/10">Meus Aluguéis</button>
            </nav>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-7">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Painel da instituição</p>
              <h2 className="font-display font-bold text-2xl text-white">Meus aluguéis</h2>
            </div>
            <button onClick={() => onNav('home')}
              className="px-4 h-9 bg-accent text-bg font-semibold text-sm rounded-lg hover:bg-cyan-300 transition-colors">
              + Nova solicitação
            </button>
          </div>

          {flash && (
            <div className="flex items-center gap-3 bg-emerald-400/10 border border-emerald-400/25 rounded-xl px-4 py-3 mb-6 text-emerald-400 text-sm">
              ✓ Solicitação <strong className="font-mono">#{flash.id}</strong> enviada — aguardando análise da operadora.
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
            {stats.map(([k, v]) => (
              <div key={k} className="bg-panel border border-white/5 rounded-xl p-5">
                <span className="font-display font-extrabold text-4xl text-white leading-none block mb-1">{v}</span>
                <span className="text-xs text-dim">{k}</span>
              </div>
            ))}
          </div>

          <div className="bg-panel border border-white/5 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
              <div className="flex gap-1">
                <span className="px-3 py-1 rounded text-sm font-medium text-accent bg-accent/10">Todos</span>
              </div>
              <span className="text-xs text-dim">Ordenar: mais recentes ▾</span>
            </div>

            {loading && <p className="text-muted text-sm p-5">Carregando…</p>}
            {error   && <p className="text-red-400 text-sm p-5">Erro: {error}</p>}

            {!loading && !error && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg2 border-b border-white/5">
                    {['Pedido','Satélite','Objetivo','Início','Duração','Status',''].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-dim">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const st = STATUS[r.status] || STATUS.analise
                    const isNew = flash && r.id === flash.id
                    return (
                      <tr key={r.id} className={`border-b border-white/5 last:border-0 hover:bg-panel2 transition-colors ${isNew ? 'bg-accent/5' : ''}`}>
                        <td className="px-4 py-3.5 font-mono text-xs text-muted">#{r.id}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-white leading-tight">{r.satelite?.nome}</div>
                          <div className="text-xs text-dim">{r.satelite?.operadora}</div>
                        </td>
                        <td className="px-4 py-3.5 text-muted max-w-[200px] truncate">{r.objetivo}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-muted">{r.dataInicio ?? '—'}</td>
                        <td className="px-4 py-3.5 text-muted">{r.duracao ?? '—'}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${st.cls}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button className="border border-white/5 rounded px-2 py-1 text-dim hover:text-white hover:border-white/10 transition-colors">⋯</button>
                        </td>
                      </tr>
                    )
                  })}
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-dim text-sm">Nenhuma solicitação ainda.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 2: Testar o fluxo completo de ponta a ponta**

  1. `npm run dev` (frontend) + `mvn spring-boot:run` (backend) rodando
  2. Login → catálogo (dados do banco) → detalhe → checkout → preencher e confirmar
  3. Dashboard abre → solicitação aparece na tabela com status `Em análise`
  4. Verificar no Supabase:
     ```sql
     SELECT * FROM solicitacoes ORDER BY criado_em DESC LIMIT 1;
     ```
  5. Conferir que o `id` da linha bate com o `#id` mostrado na tela.

- [ ] **Step 3: Commit final**

  ```powershell
  git add frontend/src/
  git commit -m "feat: dashboard screen with live data from backend"
  ```

---

## Resumo dos comandos para rodar em desenvolvimento

**Terminal 1 — Backend:**
```powershell
cd d:\globalsolution\backend
mvn spring-boot:run
```

**Terminal 2 — Frontend:**
```powershell
cd d:\globalsolution\frontend
npm run dev
```

Abrir: `http://localhost:5173`
