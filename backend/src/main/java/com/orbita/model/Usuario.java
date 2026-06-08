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
    private String role;
    private LocalDateTime criadoEm;

    // --- Preparação para autenticação em dois fatores (2FA) ---
    @Column(name = "two_factor_enabled")
    private boolean twoFactorEnabled = false;

    @Column(name = "two_factor_secret")
    private String twoFactorSecret;

    public Usuario() {}

    @PrePersist
    public void prePersist() {
        if (criadoEm == null) criadoEm = LocalDateTime.now();
        if (role == null)     role     = "usuario";
    }

    public Long getId()              { return id; }
    public String getInstituicao()   { return instituicao; }
    public String getTipo()          { return tipo; }
    public String getEmail()         { return email; }
    public String getRole()          { return role; }

    // Nunca expõe a senha (hash) nas respostas JSON
    @JsonIgnore
    public String getSenha()         { return senha; }

    public LocalDateTime getCriadoEm() { return criadoEm; }

    public boolean isTwoFactorEnabled() { return twoFactorEnabled; }

    @JsonIgnore
    public String getTwoFactorSecret() { return twoFactorSecret; }

    public void setInstituicao(String instituicao) { this.instituicao = instituicao; }
    public void setTipo(String tipo)               { this.tipo = tipo; }
    public void setEmail(String email)             { this.email = email; }
    public void setSenha(String senha)             { this.senha = senha; }
    public void setRole(String role)               { this.role = role; }
    public void setTwoFactorEnabled(boolean v)     { this.twoFactorEnabled = v; }
    public void setTwoFactorSecret(String s)       { this.twoFactorSecret = s; }
}
