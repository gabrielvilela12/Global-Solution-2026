# Vincular Solicitação ao Usuário Logado — Design Spec
**Data:** 2026-06-07
**Escopo:** Cada solicitação de aluguel passa a pertencer ao usuário que a criou; "Meus Aluguéis" mostra apenas as solicitações do usuário logado.

---

## 1. Contexto / Problema

Hoje o Dashboard ("Meus Aluguéis") lê **todas** as solicitações do banco, de qualquer instituição — não há vínculo entre `solicitacoes` e `usuarios`. Acabamos de construir login/cadastro, mas as solicitações não estão ligadas a quem as fez.

Esta entrega cria o relacionamento `solicitacao → usuario` (FK) e filtra o dashboard pelo usuário logado.

**Decisão de identidade (do brainstorming):** não há sessão/token. O frontend, que já guarda o usuário logado no `localStorage`, envia o `usuarioId` explicitamente nas requisições (POST de criação e GET do dashboard).

---

## 2. Modelo de Dados

### Migração
```sql
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES usuarios(id);
```

Solicitações antigas ficam com `usuario_id` nulo (não aparecem para nenhum usuário no filtro) — aceitável, a tabela foi limpa recentemente.

### Relacionamento
`solicitacoes.usuario_id` → `usuarios.id` (muitas solicitações para um usuário).

---

## 3. Backend

### `model/Solicitacao.java`
- Adicionar:
  ```java
  @ManyToOne
  @JoinColumn(name = "usuario_id")
  @JsonIgnore
  private Usuario usuario;
  ```
  - `@JsonIgnore`: não expõe o objeto usuário nas respostas (o dashboard só precisa das "minhas" solicitações; evita serializar dados do usuário e potencial recursão).
- Getter `getUsuario()` e setter `setUsuario(Usuario)`.
- Import: `com.fasterxml.jackson.annotation.JsonIgnore` e `com.orbita.model.Usuario` (mesmo pacote, sem import necessário para Usuario).

### `repository/SolicitacaoRepository.java`
- Adicionar: `List<Solicitacao> findByUsuarioId(Long usuarioId);`

### `repository/UsuarioRepository.java`
- Já existe; usado pelo service para carregar o `Usuario` pelo id. (Tem `findById` via JpaRepository.)

### `service/SolicitacaoService.java`
- Injetar `UsuarioRepository` no construtor (além dos repos atuais).
- `criar(Map body)`: além das validações atuais (objetivo, datas, satélite), ler `usuarioId`:
  - Se ausente/blank → `IllegalArgumentException("Usuário não identificado. Faça login novamente.")`
  - Carregar `Usuario` via `usuarioRepository.findById(usuarioId)`; se não achar → `IllegalArgumentException("Usuário não encontrado.")`
  - `s.setUsuario(usuario)`
- Novo método: `List<Solicitacao> listarPorUsuario(Long usuarioId) { return repository.findByUsuarioId(usuarioId); }`
- Manter `listarTodas()`.

### `controller/SolicitacaoController.java`
- `GET /api/solicitacoes` aceita `@RequestParam(required = false) Long usuarioId`:
  - Se `usuarioId != null` → `service.listarPorUsuario(usuarioId)`
  - Senão → `service.listarTodas()` (compatibilidade)
- `POST` permanece como está (já trata `IllegalArgumentException` → 400 com `{erro}`).

---

## 4. Frontend

### `App.jsx`
- Já tem `user` no estado (persistido em `localStorage`). Passar para as telas:
  - `<CheckoutScreen ... user={user} />`
  - `<DashboardScreen ... user={user} />`

### `api/client.js`
- `getSolicitacoes(usuarioId)`:
  ```js
  export async function getSolicitacoes(usuarioId) {
    const url = usuarioId ? `${BASE}/solicitacoes?usuarioId=${usuarioId}` : `${BASE}/solicitacoes`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar solicitações');
    return res.json();
  }
  ```

### `screens/CheckoutScreen.jsx`
- Receber prop `user`.
- Incluir `usuarioId: user?.id` no body do `criarSolicitacao`.

### `screens/DashboardScreen.jsx`
- Receber prop `user`.
- `useEffect`: chamar `getSolicitacoes(user?.id)` (em vez de `getSolicitacoes()`); manter dependência `[flash]` (e `user?.id`).

---

## 5. Fluxo ponta a ponta

1. Usuário loga → `App` guarda `user` (com `id`) no estado/localStorage
2. Cria solicitação → POST inclui `usuarioId` → backend vincula via FK e grava
3. Dashboard → GET `/api/solicitacoes?usuarioId=<id>` → retorna só as do usuário
4. Outro usuário logado vê apenas as próprias solicitações
5. Conferível no banco: `SELECT id, usuario_id, objetivo FROM solicitacoes;`

---

## 6. Arquivos afetados

**Backend:**
- `migration-solicitacoes-usuario.sql` (novo — SQL pro usuário rodar)
- `model/Solicitacao.java` (modificar)
- `repository/SolicitacaoRepository.java` (modificar)
- `service/SolicitacaoService.java` (modificar)
- `controller/SolicitacaoController.java` (modificar)

**Frontend:**
- `App.jsx` (modificar — passar `user`)
- `api/client.js` (modificar — `getSolicitacoes(usuarioId)`)
- `screens/CheckoutScreen.jsx` (modificar — enviar `usuarioId`)
- `screens/DashboardScreen.jsx` (modificar — filtrar por usuário)

---

## 7. Fora de escopo
- Token JWT / sessão real (decidido: enviar `usuarioId`)
- Migração das solicitações antigas (ficam órfãs / nulas)
- Painel da operadora (aprovar/recusar) — feature futura separada
- Autorização (impedir que um usuário forje o `usuarioId` de outro) — segurança real fica para quando houver token
