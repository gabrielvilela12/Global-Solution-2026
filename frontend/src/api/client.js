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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || 'Erro ao criar solicitação');
  return data;
}

export async function login(email, senha) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || 'Erro ao entrar');
  return data;
}

export async function cadastrar(body) {
  const res = await fetch(`${BASE}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.erro || 'Erro ao criar conta');
  return data;
}
