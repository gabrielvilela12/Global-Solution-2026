package com.orbita.controller;

import com.orbita.model.Solicitacao;
import com.orbita.service.SemPermissaoException;
import com.orbita.service.SolicitacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public List<Solicitacao> listar(@RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null) return service.listarPorUsuario(usuarioId);
        return service.listarTodas();
    }

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Map<String, Object> body) {
        try {
            Solicitacao s = service.criar(body);
            return ResponseEntity.status(HttpStatus.CREATED).body(s);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Long usuarioId = body.get("usuarioId") == null ? null : Long.valueOf(body.get("usuarioId").toString());
            String status = body.get("status") == null ? null : body.get("status").toString();
            return ResponseEntity.ok(service.atualizarStatus(id, status, usuarioId));
        } catch (SemPermissaoException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("erro", e.getMessage()));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", "Usuário inválido."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }
}
