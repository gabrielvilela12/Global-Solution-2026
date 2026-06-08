package com.orbita.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnore
    private Usuario usuario;

    private String objetivo;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private String duracao;

    @Column(name = "faixa_horaria")
    private String faixaHoraria;

    private String prioridade;
    private String status;
    private LocalDateTime criadoEm;

    public Solicitacao() {}

    @PrePersist
    public void prePersist() {
        if (status == null)   status   = "analise";
        if (criadoEm == null) criadoEm = LocalDateTime.now();
    }

    // Expõe só o nome da instituição do dono (para o painel da operadora),
    // sem serializar o objeto Usuario inteiro.
    @JsonProperty("instituicao")
    public String getInstituicao() {
        return usuario != null ? usuario.getInstituicao() : null;
    }

    public Long getId()                { return id; }
    public Satelite getSatelite()      { return satelite; }
    public Usuario getUsuario()        { return usuario; }
    public String getObjetivo()        { return objetivo; }
    public LocalDate getDataInicio()   { return dataInicio; }
    public LocalDate getDataFim()      { return dataFim; }
    public String getDuracao()         { return duracao; }
    public String getFaixaHoraria()    { return faixaHoraria; }
    public String getPrioridade()      { return prioridade; }
    public String getStatus()          { return status; }
    public LocalDateTime getCriadoEm() { return criadoEm; }

    public void setSatelite(Satelite satelite) { this.satelite = satelite; }
    public void setUsuario(Usuario usuario)    { this.usuario = usuario; }
    public void setObjetivo(String objetivo)   { this.objetivo = objetivo; }
    public void setDataInicio(LocalDate d)     { this.dataInicio = d; }
    public void setDataFim(LocalDate d)        { this.dataFim = d; }
    public void setDuracao(String duracao)     { this.duracao = duracao; }
    public void setFaixaHoraria(String f)      { this.faixaHoraria = f; }
    public void setPrioridade(String p)        { this.prioridade = p; }
    public void setStatus(String status)       { this.status = status; }
}
