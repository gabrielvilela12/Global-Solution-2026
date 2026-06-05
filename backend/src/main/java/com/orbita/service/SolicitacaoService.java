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
        Long sateliteId = Long.valueOf(body.get("sateliteId").toString());
        Satelite satelite = sateliteRepository.findById(sateliteId)
                .orElseThrow(() -> new RuntimeException("Satélite não encontrado: " + sateliteId));

        Solicitacao s = new Solicitacao();
        s.setSatelite(satelite);
        s.setObjetivo(body.get("objetivo").toString());
        s.setDuracao(body.getOrDefault("duracao", "").toString());

        Object dataObj = body.get("dataInicio");
        if (dataObj != null && !dataObj.toString().isBlank()) {
            s.setDataInicio(LocalDate.parse(dataObj.toString()));
        }

        return solicitacaoRepository.save(s);
    }
}
