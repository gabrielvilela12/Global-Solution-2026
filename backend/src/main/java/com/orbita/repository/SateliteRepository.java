package com.orbita.repository;

import com.orbita.model.Satelite;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SateliteRepository extends JpaRepository<Satelite, Long> {
}
