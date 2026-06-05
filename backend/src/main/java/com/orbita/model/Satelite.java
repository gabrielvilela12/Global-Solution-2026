package com.orbita.model;

import jakarta.persistence.*;

@Entity
@Table(name = "satelites")
public class Satelite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String operadora;
    private String categoria;
    private String orbita;
    private String capacidade;
    private String resolucao;
    private String revisita;
    private String preco;
    private String unidade;

    public Satelite() {}

    public Long getId()           { return id; }
    public String getNome()       { return nome; }
    public String getOperadora()  { return operadora; }
    public String getCategoria()  { return categoria; }
    public String getOrbita()     { return orbita; }
    public String getCapacidade() { return capacidade; }
    public String getResolucao()  { return resolucao; }
    public String getRevisita()   { return revisita; }
    public String getPreco()      { return preco; }
    public String getUnidade()    { return unidade; }
}
