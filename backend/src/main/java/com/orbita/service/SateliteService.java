package com.orbita.service;

import com.orbita.model.Satelite;
import com.orbita.repository.SateliteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SateliteService {

    private final SateliteRepository repository;

    public SateliteService(SateliteRepository repository) {
        this.repository = repository;
    }

    public List<Satelite> listarTodos() {
        return repository.findAll();
    }

    public Optional<Satelite> buscarPorId(Long id) {
        return repository.findById(id);
    }
}
