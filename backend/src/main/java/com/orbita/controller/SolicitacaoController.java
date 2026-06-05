package com.orbita.controller;

import com.orbita.model.Solicitacao;
import com.orbita.service.SolicitacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitacoes")
public class SolicitacaoController {

    private final SolicitacaoService service;

    public SolicitacaoController(SolicitacaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Solicitacao> listar() {
        return service.listarTodas();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Solicitacao criar(@RequestBody Map<String, Object> body) {
        return service.criar(body);
    }
}
