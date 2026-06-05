-- Seed opcional de solicitações de exemplo para o Dashboard.
-- Rode no SQL Editor do Supabase DEPOIS de inserir os satélites.
-- IDs de satélite após o seed: 1=GOES-Atlas 7, 2=LinkSat Orion, 3=TerraScan 12,
--                              4=Helios Watch, 5=RelaySat C2, 6=CartoSat HR

INSERT INTO solicitacoes (satelite_id, objetivo, data_inicio, duracao, status, criado_em) VALUES
(3, 'Modelo de elevação — Andes',     '2026-06-08', '1 aquisição', 'aprovado',  '2026-06-01 10:00:00'),
(2, 'Teste de downlink banda Ka',     '2026-05-30', '2 horas',     'agendado',  '2026-05-28 14:30:00'),
(4, 'Sondagem atmosférica IR',        '2026-05-21', '4 órbitas',   'concluido', '2026-05-18 09:15:00'),
(6, 'Imageamento urbano 0,3 m',       '2026-05-14', '1 aquisição', 'recusado',  '2026-05-10 16:45:00');
