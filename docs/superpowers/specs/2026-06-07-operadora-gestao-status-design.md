# Operadora + Gestão de Status das Solicitações — Design Spec
**Data:** 2026-06-07
**Escopo:** Introduzir o papel "operadora" (role) e permitir que ela altere o status das solicitações (Aprovado/Recusado/Agendado/Concluído), fechando o ciclo CRUD com Update.

---

## 1. Contexto / Problema

Hoje toda solicitação nasce `analise` e fica presa nesse status — não há desfecho. Não existe papel/role: qualquer usuário é igual. Esta entrega:
- Adiciona `role` ao usuário (`usuario` | `operadora`).
- Cria um **Painel da Operadora** que lista todas as solicitações e permite mudar o status.
- Fecha o ciclo de negócio (pedido → análise → aprovado/recusado/agendado/concluído).

**Decisões do brainstorming:**
- Papel atribuído **manualmente no banco** (cadastros novos são sempre `usuario`).
- Operadora pode aplicar **os 4 status**: `aprovado`, `recusado`, `agendado`, `concluido`.
- Autorização verificada no backend pelo `role` (sem token — forjável, fora de escopo de segurança real).

---

## 2. Modelo de Dados

### Migração
```sql
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'usuario';
-- promover uma conta para operadora (ex.: a demo):
UPDATE usuarios SET role = 'operadora' WHERE email = 'demo@universidade.edu';
```

`role` aceita `'usuario'` (default) ou `'operadora'`.

---

## 3. Backend

### `model/Usuario.java`
- Adicionar campo `private String role;` + getter `getRole()` (serializado — **sem** `@JsonIgnore`, o frontend precisa do papel) e setter `setRole(String)`.
- `@PrePersist`: se `role` nulo → `role = "usuario"` (garante default mesmo em inserts via app).

### `model/Solicitacao.java`
- Adicionar getter calculado para expor a instituição do dono (sem expor o objeto usuário inteiro, que segue `@JsonIgnore`):
  ```java
  @com.fasterxml.jackson.annotation.JsonProperty("instituicao")
  public String getInstituicao() {
      return usuario != null ? usuario.getInstituicao() : null;
  }
  ```
  Assim o JSON de cada solicitação ganha `"instituicao": "<nome>"` para o painel da operadora.

### `repository/UsuarioRepository.java`
- Já existe (`findById`, `findByEmail`). Sem mudança.

### `service/SolicitacaoService.java`
- Constante dos status válidos para transição:
  ```java
  private static final java.util.Set<String> STATUS_VALIDOS =
      java.util.Set.of("aprovado", "recusado", "agendado", "concluido");
  ```
- Novo método:
  ```java
  public Solicitacao atualizarStatus(Long id, String novoStatus, Long usuarioId) {
      Usuario ator = usuarioRepository.findById(usuarioId)
          .orElseThrow(() -> new IllegalArgumentException("Usuário não identificado."));
      if (!"operadora".equals(ator.getRole()))
          throw new SemPermissaoException("Apenas operadoras podem alterar o status.");
      String s = novoStatus == null ? "" : novoStatus.trim().toLowerCase();
      if (!STATUS_VALIDOS.contains(s))
          throw new IllegalArgumentException("Status inválido.");
      Solicitacao sol = solicitacaoRepository.findById(id)
          .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada."));
      sol.setStatus(s);
      return solicitacaoRepository.save(sol);
  }
  ```
- `SemPermissaoException` (RuntimeException simples) em arquivo próprio `service/SemPermissaoException.java`, usada para mapear a 403 no controller.

### `controller/SolicitacaoController.java`
- Novo endpoint:
  ```java
  @PutMapping("/{id}/status")
  public ResponseEntity<?> atualizarStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
      try {
          Long usuarioId = Long.valueOf(body.get("usuarioId").toString());
          String status = body.get("status") == null ? null : body.get("status").toString();
          return ResponseEntity.ok(service.atualizarStatus(id, status, usuarioId));
      } catch (SemPermissaoException e) {
          return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", e.getMessage()));
      } catch (IllegalArgumentException | NullPointerException e) {
          return ResponseEntity.badRequest().body(Map.of("erro", "Requisição inválida."));
      }
  }
  ```
- GET de todas as solicitações já existe (`listar` sem `usuarioId`) — reutilizado pelo painel da operadora.

---

## 4. Frontend

### Login / `App.jsx`
- O `user` persistido já vem do login; agora inclui `role`.
- Adicionar rota `operadora`: `if (screen === 'operadora') return <OperadoraScreen onNav={nav} user={user} />`.

### `components/ui.jsx` — TopBar
- O `TopBar` passa a exibir um item **"Operadora"** apenas quando o usuário logado tem `role === 'operadora'`.
- Fonte do papel: ler o usuário persistido do `localStorage` (`orbita_user`) dentro do TopBar (evita threadear `user` por todas as telas). Helper local:
  ```js
  function papelUsuario() {
    try { return (JSON.parse(localStorage.getItem('orbita_user') || 'null')?.role) || 'usuario' } catch { return 'usuario' }
  }
  ```
  Se `papelUsuario() === 'operadora'`, renderiza `<NavItem on={() => onNav('operadora')} act={active==='operadora'}>Operadora</NavItem>`.

### `api/client.js`
- Nova função:
  ```js
  export async function atualizarStatusSolicitacao(id, status, usuarioId) {
    const res = await fetch(`${BASE}/solicitacoes/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, usuarioId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.erro || 'Erro ao atualizar status');
    return data;
  }
  ```

### `screens/OperadoraScreen.jsx` (novo)
- Recebe `onNav`, `user`.
- `useEffect`: `getSolicitacoes()` (sem filtro → todas), ordena por id desc.
- Tabela com colunas: Pedido, Instituição (`r.instituicao`), Satélite, Objetivo, Janela, Status (StatusPill atual), Ação.
- Coluna "Ação": um `<select>` estilizado (reusar padrão visual) com as 4 opções (Aprovar→aprovado, Recusar→recusado, Agendar→agendado, Concluir→concluido). Ao escolher → `atualizarStatusSolicitacao(r.id, valor, user.id)` → ao sucesso, atualiza a linha no estado (refetch ou substituição local).
- Cabeçalho: kicker "Painel da operadora" + título "Gestão de solicitações". Reusa `TopBar active="operadora"`.
- Tratamento de erro: exibir mensagem se o PUT falhar (ex.: 403).

---

## 5. Fluxo ponta a ponta

1. Conta promovida a `operadora` no banco (manual)
2. Operadora loga → `user.role === 'operadora'` → TopBar mostra "Operadora"
3. Abre o painel → lista todas as solicitações (com instituição)
4. Escolhe "Aprovar" numa linha → `PUT /api/solicitacoes/{id}/status` `{status:'aprovado', usuarioId}` → backend confere role + grava
5. O solicitante, em "Meus Aluguéis", vê o status atualizado (próximo carregamento)
6. Conferível no banco: `SELECT id, status FROM solicitacoes;`

---

## 6. Arquivos afetados

**Backend:**
- `migration-usuarios-role.sql` (novo — SQL pro usuário rodar)
- `model/Usuario.java` (modificar — campo role)
- `model/Solicitacao.java` (modificar — getInstituicao calculado)
- `service/SolicitacaoService.java` (modificar — atualizarStatus + STATUS_VALIDOS)
- `service/SemPermissaoException.java` (novo — exceção 403)
- `controller/SolicitacaoController.java` (modificar — PUT /{id}/status)

**Frontend:**
- `App.jsx` (modificar — rota operadora)
- `components/ui.jsx` (modificar — item "Operadora" no TopBar)
- `api/client.js` (modificar — atualizarStatusSolicitacao)
- `screens/OperadoraScreen.jsx` (novo — painel)

---

## 7. Fora de escopo
- Token/sessão real (autorização forjável — como nas features anteriores)
- Histórico de mudanças de status (auditoria)
- Notificação ao solicitante quando o status muda
- Tela de "Meus Aluguéis" para a operadora (ela usa só o painel)
- Transições de status restritas por máquina de estados (qualquer um dos 4 é permitido)
