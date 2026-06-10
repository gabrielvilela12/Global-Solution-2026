# ORBITA.market

Marketplace de aluguel de tempo de satélite — conecta instituições que precisam de
dados de observação da Terra às operadoras que possuem os satélites. O usuário explora
o catálogo, abre uma solicitação de janela de uso, e a operadora gerencia o status do
pedido (análise → aprovado / recusado / agendado / concluído).

Projeto desenvolvido para a **Global Solution 2026 — Desafio Space Connect (FIAP)**.

## Stack

| Camada   | Tecnologias                                                        |
|----------|--------------------------------------------------------------------|
| Back-end | Java 21, Spring Boot (Web + Data JPA), Spring Security Crypto (BCrypt) |
| Banco    | PostgreSQL (Supabase)                                              |
| Front-end| React 19, Vite, Tailwind CSS                                       |

## Estrutura

```
backend/    API REST em Spring Boot (controllers, services, repositories, models)
frontend/   SPA em React + Vite (telas, componentes, cliente HTTP)
```

## Como rodar

### Pré-requisitos
- Java 21 e Maven
- Node.js 18+
- Um banco PostgreSQL (ex.: projeto no Supabase)

### Back-end

```bash
cd backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
# edite application.properties com o host/usuário/senha do seu Postgres
mvn spring-boot:run
```

A API sobe em `http://localhost:8080`.

> O schema é versionado pelos arquivos `migration-*.sql`. Rode-os no banco antes de
> iniciar a aplicação (o Hibernate roda em modo `validate`, não cria tabelas). Os
> arquivos `seed-*.sql` populam dados de exemplo.

### Front-end

```bash
cd frontend
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Principais endpoints

| Método | Rota                              | Descrição                                  |
|--------|-----------------------------------|--------------------------------------------|
| POST   | `/api/usuarios`                   | Cadastro de instituição                    |
| POST   | `/api/auth/login`                 | Login (senha validada com BCrypt)          |
| GET    | `/api/satelites`                  | Catálogo de satélites                       |
| POST   | `/api/solicitacoes`               | Cria uma solicitação (nasce em "análise")  |
| GET    | `/api/solicitacoes?usuarioId=`    | Solicitações de um usuário                  |
| PUT    | `/api/solicitacoes/{id}/status`   | Atualiza status (somente papel `operadora`) |

A autorização por papéis é validada no servidor: alterar o status sendo um usuário
comum retorna **HTTP 403**.

## Autores

- Luis Gustavo Fernandes Rivalta — RM 561742
- Gabriel Vilela Peixoto — RM 562125
