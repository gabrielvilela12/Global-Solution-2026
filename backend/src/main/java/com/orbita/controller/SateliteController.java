package com.orbita.controller;

import com.orbita.model.Satelite;
import com.orbita.service.SateliteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/satelites")
public class SateliteController {

    private final SateliteService service;

    public SateliteController(SateliteService service) {
        this.service = service;
    }

    @GetMapping
    public List<Satelite> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Satelite> buscar(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
