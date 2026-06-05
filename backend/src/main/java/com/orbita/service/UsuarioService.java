package com.orbita.service;

import com.orbita.model.Usuario;
import com.orbita.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public Usuario cadastrar(Map<String, Object> body) {
        String email = str(body.get("email"));
        String senha = str(body.get("senha"));
        String instituicao = str(body.get("instituicao"));

        if (email.isBlank() || senha.isBlank() || instituicao.isBlank()) {
            throw new IllegalArgumentException("Instituição, e-mail e senha são obrigatórios.");
        }
        if (repository.findByEmail(email).isPresent()) {
            throw new IllegalStateException("Já existe uma conta com esse e-mail.");
        }

        Usuario u = new Usuario();
        u.setInstituicao(instituicao);
        u.setTipo(str(body.get("tipo")));
        u.setEmail(email);
        u.setSenha(senha);
        return repository.save(u);
    }

    public Usuario autenticar(String email, String senha) {
        Usuario u = repository.findByEmail(str(email))
                .orElseThrow(() -> new IllegalArgumentException("E-mail ou senha inválidos."));
        if (!u.getSenha().equals(senha)) {
            throw new IllegalArgumentException("E-mail ou senha inválidos.");
        }
        return u;
    }

    private static String str(Object o) {
        return o == null ? "" : o.toString().trim();
    }
}
