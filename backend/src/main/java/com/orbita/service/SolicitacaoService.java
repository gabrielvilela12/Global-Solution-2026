package com.orbita.service;

import com.orbita.model.Satelite;
import com.orbita.model.Solicitacao;
import com.orbita.repository.SateliteRepository;
import com.orbita.repository.SolicitacaoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final SateliteRepository sateliteRepository;

    public SolicitacaoService(SolicitacaoRepository solicitacaoRepository,
                              SateliteRepository sateliteRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.sateliteRepository    = sateliteRepository;
    }

    public List<Solicitacao> listarTodas() {
        return solicitacaoRepository.findAll();
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

        Solicitacao s = new Solicitacao();
        s.setSatelite(satelite);
        s.setObjetivo(objetivo);
        s.setDataInicio(inicio);
        s.setDataFim(fim);
        s.setDuracao(str(body.get("duracao")));
        s.setFaixaHoraria(str(body.get("faixaHoraria")));
        s.setPrioridade(str(body.get("prioridade")));
        return solicitacaoRepository.save(s);
    }

    private static LocalDate parseData(Object o) {
        String v = str(o);
        return v.isBlank() ? null : LocalDate.parse(v);
    }

    private static String str(Object o) {
        return o == null ? "" : o.toString().trim();
    }
}
