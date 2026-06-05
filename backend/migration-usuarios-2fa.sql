-- Migração: hash de senha (BCrypt) + preparação para 2FA.
-- Rode no SQL Editor do Supabase ANTES de reiniciar o backend.

-- 1. Colunas para 2FA (ainda não usadas no fluxo, mas o schema já fica pronto)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS two_factor_secret  VARCHAR(64);

-- 2. Limpa usuários antigos com senha em TEXTO PURO.
--    O usuário demo é recriado automaticamente com senha em hash no startup do backend.
DELETE FROM usuarios;
