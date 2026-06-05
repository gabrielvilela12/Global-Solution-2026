package com.orbita.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String instituicao;
    private String tipo;
    private String email;
    private String senha;
    private LocalDateTime criadoEm;

    public Usuario() {}

    @PrePersist
    public void prePersist() {
        if (criadoEm == null) criadoEm = LocalDateTime.now();
    }

    public Long getId()              { return id; }
    public String getInstituicao()   { return instituicao; }
    public String getTipo()          { return tipo; }
    public String getEmail()         { return email; }

    // Nunca expõe a senha nas respostas JSON
    @JsonIgnore
    public String getSenha()         { return senha; }

    public LocalDateTime getCriadoEm() { return criadoEm; }

    public void setInstituicao(String instituicao) { this.instituicao = instituicao; }
    public void setTipo(String tipo)               { this.tipo = tipo; }
    public void setEmail(String email)             { this.email = email; }
    public void setSenha(String senha)             { this.senha = senha; }
}
