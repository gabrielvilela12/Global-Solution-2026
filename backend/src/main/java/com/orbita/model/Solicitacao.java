package com.orbita.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitacoes")
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "satelite_id")
    private Satelite satelite;

    private String objetivo;
    private LocalDate dataInicio;
    private String duracao;
    private String status;
    private LocalDateTime criadoEm;

    public Solicitacao() {}

    @PrePersist
    public void prePersist() {
        if (status == null)   status   = "analise";
        if (criadoEm == null) criadoEm = LocalDateTime.now();
    }

    public Long getId()                { return id; }
    public Satelite getSatelite()      { return satelite; }
    public String getObjetivo()        { return objetivo; }
    public LocalDate getDataInicio()   { return dataInicio; }
    public String getDuracao()         { return duracao; }
    public String getStatus()          { return status; }
    public LocalDateTime getCriadoEm() { return criadoEm; }

    public void setSatelite(Satelite satelite) { this.satelite = satelite; }
    public void setObjetivo(String objetivo)   { this.objetivo = objetivo; }
    public void setDataInicio(LocalDate d)     { this.dataInicio = d; }
    public void setDuracao(String duracao)     { this.duracao = duracao; }
    public void setStatus(String status)       { this.status = status; }
}
