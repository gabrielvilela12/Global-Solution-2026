# Solicitação de Aluguel + Calendário Custom — Design Spec
**Data:** 2026-06-07
**Escopo:** Fluxo completo de solicitar aluguel de satélite (período via calendário custom, objetivo, opções) gravando no banco e exibindo em "Meus Aluguéis".

---

## 1. Contexto

O fluxo já existe parcialmente: `CheckoutScreen` faz `POST /api/solicitacoes` e `DashboardScreen` lê de `GET /api/solicitacoes`. Esta entrega:
- Substitui o `<input type="date">` nativo por um **calendário custom** (range início+fim) em popover.
- Persiste campos hoje decorativos: **faixa horária** e **prioridade**.
- Adiciona **data de fim** (janela = início → fim).
- Ajusta a exibição no dashboard (coluna "Janela").

Decisões tomadas no brainstorming:
- Calendário: **range** (início + fim), **popover**, **bloqueia datas passadas**.
- Faixa horária e prioridade: **persistir no banco**.
- Upload de arquivo (anexar protocolo): **decorativo por enquanto** (fora de escopo).
- Calendário: **componente custom em React puro**, sem biblioteca.

---

## 2. Modelo de Dados

### Migração — novas colunas em `solicitacoes`
```sql
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_fim      DATE;
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS faixa_horaria VARCHAR(50);
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS prioridade    VARCHAR(30);
```

### Tabela final `solicitacoes`
| Coluna | Tipo | Observação |
|--------|------|-----------|
| id | BIGSERIAL PK | |
| satelite_id | BIGINT FK | |
| objetivo | TEXT | obrigatório |
| data_inicio | DATE | início da janela |
| data_fim | DATE | fim da janela (NOVO) |
| duracao | VARCHAR(50) | tempo de uso (ex: "3 órbitas") |
| faixa_horaria | VARCHAR(50) | NOVO |
| prioridade | VARCHAR(30) | NOVO |
| status | VARCHAR(20) | default 'analise' |
| criado_em | TIMESTAMP | default NOW() |

---

## 3. Backend

### `model/Solicitacao.java`
Adicionar campos + getters/setters:
- `private LocalDate dataFim;`
- `private String faixaHoraria;` → `@Column(name = "faixa_horaria")`
- `private String prioridade;`

### `service/SolicitacaoService.java` — método `criar`
Lê do `Map<String,Object> body`:
- `sateliteId`, `objetivo`, `dataInicio`, `dataFim`, `duracao`, `faixaHoraria`, `prioridade`

Validações:
- `objetivo` não vazio → senão `IllegalArgumentException("Descreva o objetivo da coleta.")`
- `dataInicio` presente → senão `IllegalArgumentException("Selecione a janela de uso.")`
- Se `dataFim` presente e `dataFim < dataInicio` → `IllegalArgumentException("A data final deve ser igual ou posterior à inicial.")`

Parse de datas igual ao já existente (`LocalDate.parse` se não vazio).

### `controller/SolicitacaoController.java`
`POST /api/solicitacoes` passa as exceptions a um retorno adequado:
- `IllegalArgumentException` → `400` com `{ "erro": mensagem }`

(Hoje o controller não trata erro; ajustar para devolver 400 com mensagem, como o `AuthController`.)

---

## 4. Componente `Calendar` (frontend)

Arquivo novo: `frontend/src/components/Calendar.jsx`. React puro, sem dependência.

### `Calendar`
- **Props:** `value` (`{ inicio: 'YYYY-MM-DD'|null, fim: 'YYYY-MM-DD'|null }`), `onChange(range)`, `minDate` (Date, default = hoje).
- **Estado interno:** `mesVisivel` (Date do 1º dia do mês exibido), `hover` (dia sob o mouse, para preview do range).
- **Render:**
  - Cabeçalho: `◀  Junho 2026  ▶` (Space Grotesk). Botões prev/next mudam `mesVisivel`.
  - Linha de siglas: `D S T Q Q S S`.
  - Grid 7 colunas com os dias do mês (preenchendo offset do 1º dia da semana). Dias de outros meses ficam vazios.
  - Cada dia:
    - **Passado / < minDate:** cinza (`text-dim`), `disabled`, não clicável.
    - **Hoje:** anel sutil (`ring-1 ring-line2`).
    - **Selecionado (início ou fim):** fundo accent sólido, texto `ink`.
    - **Dentro do range:** fundo `accent/15`.
    - Hover em dia válido: borda accent.
- **Lógica de seleção:**
  - Sem início, ou início+fim já definidos → clique define `inicio` e zera `fim` (começa novo range).
  - Com início e sem fim → clique define `fim`; se clicado < início, vira o novo `inicio` (reinicia).
  - `onChange` emite `{ inicio, fim }` em ISO.

### `DateRangeField` (popover)
- **Props:** `label`, `value`, `onChange`, `required`, `hint`.
- Mostra um campo no estilo `Field` exibindo `08 jun – 12 jun 2026` (ou placeholder "Selecione o período" se vazio) + ícone de calendário.
- Clique abre o `Calendar` num popover absoluto abaixo do campo.
- Fecha ao: clicar fora (listener de `mousedown` no document), selecionar o fim, ou tecla Esc.
- Formatação de data reaproveita helper `fmtData` de `ui.jsx` (formato `08 jun 2026`).

---

## 5. CheckoutScreen

Em `frontend/src/screens/CheckoutScreen.jsx`:
- Estado: trocar `dataInicio` por `periodo` (`{ inicio, fim }`); manter `duracao`, `faixa`, `prioridade`, `objetivo`.
- Bloco "Período do aluguel":
  - Substituir o campo "Data de início" pelo **`DateRangeField`** (ocupando a primeira coluna; "Tempo necessário" continua na segunda).
  - "Faixa horária (UTC)" e "Prioridade" seguem como selects (agora os valores vão no POST).
- `handleSubmit`:
  - Validar: `periodo.inicio` definido (senão erro "Selecione a janela de uso."), `objetivo` preenchido.
  - `criarSolicitacao({ sateliteId, objetivo, dataInicio: periodo.inicio, dataFim: periodo.fim, duracao, faixaHoraria: faixa, prioridade })`.
- Card "Resumo do pedido": adicionar linha "Janela" com `inicio – fim` quando selecionado.

`api/client.js`: `criarSolicitacao` envia o body inteiro (só passar os novos campos) **e** precisa passar a ler a mensagem de erro do backend (campo `erro`), igual `login`/`cadastrar` fazem, para exibir a validação 400 no formulário.

---

## 6. DashboardScreen

Em `frontend/src/screens/DashboardScreen.jsx`:
- Cabeçalho da tabela: coluna "Início" → **"Janela"**.
- Célula: se `r.dataFim` existir → `fmtData(r.dataInicio) + ' – ' + fmtData(r.dataFim)`; senão `fmtData(r.dataInicio)`.
- Demais colunas inalteradas. Continua lendo de `GET /api/solicitacoes`.

---

## 7. Fluxo ponta a ponta

1. Catálogo → Detalhes → "Solicitar uso"
2. Checkout: escolhe **período** no calendário custom (bloqueando passado), preenche objetivo, escolhe duração/faixa/prioridade
3. "Confirmar solicitação" → `POST /api/solicitacoes` grava tudo no Supabase (status `analise`)
4. Redireciona pro Dashboard → nova linha no topo com a **janela** e status "Em análise"
5. Conferível no Supabase (`SELECT * FROM solicitacoes ORDER BY criado_em DESC`)

---

## 8. Arquivos afetados

**Backend:**
- `model/Solicitacao.java` (modificar)
- `service/SolicitacaoService.java` (modificar)
- `controller/SolicitacaoController.java` (modificar — tratar erro 400)
- `migration-solicitacoes-janela.sql` (novo — SQL pro usuário rodar)

**Frontend:**
- `components/Calendar.jsx` (novo — `Calendar` + `DateRangeField`)
- `screens/CheckoutScreen.jsx` (modificar)
- `screens/DashboardScreen.jsx` (modificar)

---

## 9. Fora de escopo
- Upload real do protocolo (Supabase Storage)
- Edição/cancelamento de solicitação pelo usuário
- Validação de disponibilidade real da janela orbital (regra de negócio fictícia)
