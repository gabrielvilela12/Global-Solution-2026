# ORBITA.market — Design Spec
**Data:** 2026-06-04  
**Escopo:** Backend Java + integração com frontend React

---

## 1. Contexto

Projeto universitário (Global Solution — 1º semestre). O objetivo é demonstrar OOP em Java com acesso a banco de dados e uma interface gráfica funcional. A entrega é um vídeo explicativo.

A funcionalidade principal a demonstrar de ponta a ponta:
- Usuário faz uma solicitação de uso de satélite → salva no banco (POST)
- Dashboard busca todas as solicitações do banco → exibe na tela (GET)

---

## 2. Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Tailwind CSS (Vite) |
| Backend | Java 21 + Spring Boot 3 |
| Persistência | Spring Data JPA + Hibernate |
| Banco de dados | Supabase (PostgreSQL) |
| Driver JDBC | `postgresql` |
| Build tool | Maven |

---

## 3. Arquitetura

```
React + Tailwind (porta 5173)
        │  HTTP/JSON  (fetch com CORS)
        ▼
Spring Boot REST API (porta 8080)
        │  JPA / PostgreSQL driver
        ▼
Supabase — PostgreSQL
```

O frontend nunca acessa o banco diretamente. Toda lógica passa pelo backend Java.

---

## 4. Modelo de Dados

### Tabela `satelites`
```sql
CREATE TABLE satelites (
    id         BIGSERIAL PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    operadora  VARCHAR(100) NOT NULL,
    categoria  VARCHAR(50)  NOT NULL,  -- Clima | Comunicação | Topografia
    orbita     VARCHAR(100),
    capacidade VARCHAR(200),
    resolucao  VARCHAR(50),
    revisita   VARCHAR(100),
    preco      VARCHAR(30),
    unidade    VARCHAR(30)             -- / órbita | / hora | / aquisição
);
```

### Tabela `solicitacoes`
```sql
CREATE TABLE solicitacoes (
    id            BIGSERIAL PRIMARY KEY,
    satelite_id   BIGINT REFERENCES satelites(id),
    objetivo      TEXT         NOT NULL,
    data_inicio   DATE,
    duracao       VARCHAR(50),
    status        VARCHAR(20)  NOT NULL DEFAULT 'analise',
    criado_em     TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

### Seed — dados dos 6 satélites
```sql
INSERT INTO satelites (nome, operadora, categoria, orbita, capacidade, resolucao, revisita, preco, unidade) VALUES
('GOES-Atlas 7',  'Meteora Space',    'Clima',       'GEO · 35.786 km', 'Imageamento multiespectral · 16 bandas', '0,5 km / pixel',  'Contínuo (geoestacionário)', 'US$ 1.240', '/ órbita'),
('LinkSat Orion', 'Vega Networks',    'Comunicação', 'LEO · 550 km',    'Downlink banda Ka · 1,2 Gbps',           '—',               '8 passagens / dia',          'US$ 880',   '/ hora'),
('TerraScan 12',  'GeoOrbit Labs',    'Topografia',  'SSO · 620 km',    'Radar SAR banda-X',                       '1,0 m / pixel',   '11 dias',                    'US$ 1.560', '/ aquisição'),
('Helios Watch',  'Solaris Dynamics', 'Clima',       'SSO · 705 km',    'Sondagem atmosférica · IR',               '2,0 km / pixel',  '2x / dia',                   'US$ 640',   '/ órbita'),
('RelaySat C2',   'NovaLink',         'Comunicação', 'MEO · 8.000 km',  'Relay banda-S · baixa latência',          '—',               'Janelas de 40 min',          'US$ 1.020', '/ hora'),
('CartoSat HR',   'Andes Imaging',    'Topografia',  'SSO · 505 km',    'Óptico pancromático',                     '0,3 m / pixel',   '5 dias',                     'US$ 2.100', '/ aquisição');
```

---

## 5. API REST

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/satelites` | Retorna lista de todos os satélites |
| GET | `/api/satelites/{id}` | Retorna detalhes de um satélite |
| GET | `/api/solicitacoes` | Retorna todas as solicitações (dashboard) |
| POST | `/api/solicitacoes` | Cria nova solicitação de uso |

### POST `/api/solicitacoes` — body JSON
```json
{
  "sateliteId": 1,
  "objetivo": "Monitorar cobertura de nuvens sobre a Amazônia",
  "dataInicio": "2026-06-12",
  "duracao": "3 órbitas"
}
```

### Resposta padrão de sucesso
```json
{
  "id": 6,
  "satelite": { "id": 1, "nome": "GOES-Atlas 7", "operadora": "Meteora Space" },
  "objetivo": "Monitorar cobertura de nuvens sobre a Amazônia",
  "dataInicio": "2026-06-12",
  "duracao": "3 órbitas",
  "status": "analise",
  "criadoEm": "2026-06-04T14:30:00"
}
```

---

## 6. Estrutura de Pacotes Java

```
src/main/java/com/orbita/
├── OrbitaApplication.java          ← entry point (@SpringBootApplication)
├── config/
│   └── CorsConfig.java             ← libera CORS para localhost:5173
├── model/
│   ├── Satelite.java               ← @Entity — mapeamento da tabela satelites
│   └── Solicitacao.java            ← @Entity — mapeamento da tabela solicitacoes
├── repository/
│   ├── SateliteRepository.java     ← interface JpaRepository<Satelite, Long>
│   └── SolicitacaoRepository.java  ← interface JpaRepository<Solicitacao, Long>
├── service/
│   ├── SateliteService.java        ← regras de negócio para satélites
│   └── SolicitacaoService.java     ← regras de negócio para solicitações
└── controller/
    ├── SateliteController.java     ← @RestController /api/satelites
    └── SolicitacaoController.java  ← @RestController /api/solicitacoes
```

**Responsabilidades por camada (OOP):**
- **Model**: encapsula os dados e o mapeamento com o banco
- **Repository**: abstrai o acesso ao banco (interface — sem implementação manual)
- **Service**: contém a lógica de negócio, valida dados antes de persistir
- **Controller**: recebe HTTP, delega ao Service, retorna JSON

---

## 7. Configuração (`application.properties`)

```properties
spring.datasource.url=jdbc:postgresql://[host-supabase]:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=[senha-supabase]
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
server.port=8080
```

---

## 8. Estrutura de Pastas do Projeto Completo

```
globalsolution/
├── backend/                   ← projeto Maven Spring Boot
│   ├── pom.xml
│   └── src/
├── frontend/                  ← projeto Vite + React + Tailwind
│   ├── package.json
│   └── src/
└── docs/
    └── superpowers/specs/
        └── 2026-06-04-orbita-backend-design.md
```

---

## 9. Fluxo Principal (demonstração em vídeo)

1. Frontend carrega → `GET /api/satelites` → exibe catálogo com dados do banco
2. Usuário clica em satélite → vê detalhes
3. Usuário preenche formulário de solicitação → `POST /api/solicitacoes`
4. Backend valida e persiste no Supabase → retorna solicitação criada com status `analise`
5. Frontend redireciona para Dashboard → `GET /api/solicitacoes` → nova solicitação aparece na tabela

---

## 10. Fora do Escopo (MVP)

- Autenticação/login real (usuário fixo no frontend)
- Filtros avançados no dashboard
- Upload de arquivo de protocolo de pesquisa
- Notificações em tempo real
- Troca de status pelo admin
