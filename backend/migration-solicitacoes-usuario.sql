-- Vincula cada solicitação ao usuário (instituição) que a criou
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS usuario_id BIGINT REFERENCES usuarios(id);
