-- Janela de uso (data_fim) + campos antes decorativos (faixa_horaria, prioridade)
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS data_fim      DATE;
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS faixa_horaria VARCHAR(50);
ALTER TABLE solicitacoes ADD COLUMN IF NOT EXISTS prioridade    VARCHAR(30);
