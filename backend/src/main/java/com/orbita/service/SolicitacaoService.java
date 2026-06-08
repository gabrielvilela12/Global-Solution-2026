package com.orbita.service;

import com.orbita.model.Satelite;
import com.orbita.model.Solicitacao;
import com.orbita.model.Usuario;
import com.orbita.repository.SateliteRepository;
import com.orbita.repository.SolicitacaoRepository;
import com.orbita.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class SolicitacaoService {

    private static final Set<String> STATUS_VALIDOS =
            Set.of("aprovado", "recusado", "agendado", "concluido");

    private final SolicitacaoRepository solicitacaoRepository;
    private final SateliteRepository sateliteRepository;
    private final UsuarioRepository usuarioRepository;

    public SolicitacaoService(SolicitacaoRepository solicitacaoRepository,
                              SateliteRepository sateliteRepository,
                              UsuarioRepository usuarioRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.sateliteRepository    = sateliteRepository;
        this.usuarioRepository      = usuarioRepository;
    }

    public List<Solicitacao> listarTodas() {
        return solicitacaoRepository.findAll();
    }

    public List<Solicitacao> listarPorUsuario(Long usuarioId) {
        return solicitacaoRepository.findByUsuarioId(usuarioId);
    }

    public Solicitacao criar(Map<String, Object> body) {
        String objetivo = str(body.get("objetivo"));
        if (objetivo.isBlank()) throw new IllegalArgumentException("Descreva o objetivo da coleta.");

        LocalDate inicio = parseData(body.get("dataInicio"));
        if (inicio == null) throw new IllegalArgumentException("Selecione a janela de uso.");

        LocalDate fim = parseData(body.get("dataFim"));
        if (fim != null && fim.isBefore(inicio))
            throw new IllegalArgumentException("A data final deve ser igual ou posterior à inicial.");

        String sateliteIdStr = str(body.get("sateliteId"));
        if (sateliteIdStr.isBlank()) throw new IllegalArgumentException("Satélite não informado.");
        Long sateliteId;
        try {
            sateliteId = Long.valueOf(sateliteIdStr);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Satélite inválido.");
        }
        Satelite satelite = sateliteRepository.findById(sateliteId)
                .orElseThrow(() -> new IllegalArgumentException("Satélite não encontrado: " + sateliteId));

        String usuarioIdStr = str(body.get("usuarioId"));
        if (usuarioIdStr.isBlank()) throw new IllegalArgumentException("Usuário não identificado. Faça login novamente.");
        Long usuarioId;
        try {
            usuarioId = Long.valueOf(usuarioIdStr);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Usuário inválido.");
        }
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        Solicitacao s = new Solicitacao();
        s.setSatelite(satelite);
        s.setUsuario(usuario);
        s.setObjetivo(objetivo);
        s.setDataInicio(inicio);
        s.setDataFim(fim);
        s.setDuracao(str(body.get("duracao")));
        s.setFaixaHoraria(str(body.get("faixaHoraria")));
        s.setPrioridade(str(body.get("prioridade")));
        return solicitacaoRepository.save(s);
    }

    public Solicitacao atualizarStatus(Long id, String novoStatus, Long usuarioId) {
        if (usuarioId == null) throw new IllegalArgumentException("Usuário não identificado.");
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

    private static LocalDate parseData(Object o) {
        String v = str(o);
        return v.isBlank() ? null : LocalDate.parse(v);
    }

    private static String str(Object o) {
        return o == null ? "" : o.toString().trim();
    }
}
