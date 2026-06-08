-- Papel do usuário: 'usuario' (default) ou 'operadora'
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'usuario';

-- Promover uma conta para operadora (ajuste o e-mail conforme desejar):
UPDATE usuarios SET role = 'operadora' WHERE email = 'demo@universidade.edu';
