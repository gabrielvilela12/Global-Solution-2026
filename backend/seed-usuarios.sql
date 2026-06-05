-- Tabela de usuários (instituições) para cadastro e login.
-- Rode no SQL Editor do Supabase.

CREATE TABLE usuarios (
    id          BIGSERIAL PRIMARY KEY,
    instituicao VARCHAR(120) NOT NULL,
    tipo        VARCHAR(40),
    email       VARCHAR(160) NOT NULL UNIQUE,
    senha       VARCHAR(120) NOT NULL,
    criado_em   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Usuário de exemplo para testar o login (email: demo@universidade.edu / senha: 123456)
INSERT INTO usuarios (instituicao, tipo, email, senha) VALUES
('Universidade Federal', 'Universidade', 'demo@universidade.edu', '123456');
