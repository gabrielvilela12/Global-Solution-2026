package com.orbita.service;

import com.orbita.model.Usuario;
import com.orbita.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.regex.Pattern;

@Service
public class UsuarioService {

    private static final Pattern EMAIL_REGEX =
            Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final int SENHA_MIN = 6;

    private final UsuarioRepository repository;
    private final PasswordEncoder encoder;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder encoder) {
        this.repository = repository;
        this.encoder = encoder;
    }

    public Usuario cadastrar(Map<String, Object> body) {
        String instituicao = str(body.get("instituicao"));
        String email = normalizarEmail(str(body.get("email")));
        String senha = str(body.get("senha"));

        if (instituicao.isBlank()) throw new IllegalArgumentException("Informe a instituição.");
        if (!EMAIL_REGEX.matcher(email).matches()) throw new IllegalArgumentException("E-mail inválido.");
        if (senha.length() < SENHA_MIN)
            throw new IllegalArgumentException("A senha deve ter ao menos " + SENHA_MIN + " caracteres.");
        if (repository.findByEmail(email).isPresent())
            throw new IllegalStateException("Já existe uma conta com esse e-mail.");

        Usuario u = new Usuario();
        u.setInstituicao(instituicao);
        u.setTipo(str(body.get("tipo")));
        u.setEmail(email);
        u.setSenha(encoder.encode(senha)); // hash BCrypt
        return repository.save(u);
    }

    public Usuario autenticar(String email, String senha) {
        Usuario u = repository.findByEmail(normalizarEmail(str(email)))
                .orElseThrow(() -> new IllegalArgumentException("E-mail ou senha inválidos."));
        if (!encoder.matches(senha, u.getSenha()))
            throw new IllegalArgumentException("E-mail ou senha inválidos.");
        return u;
    }

    private static String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }

    private static String str(Object o) {
        return o == null ? "" : o.toString().trim();
    }
}
