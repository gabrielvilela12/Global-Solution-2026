package com.orbita.config;

import com.orbita.model.Usuario;
import com.orbita.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Garante que o usuário de demonstração exista com a senha já em hash.
 * Roda no startup; se o usuário já existir, não faz nada.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository repository;
    private final PasswordEncoder encoder;

    public DataInitializer(UsuarioRepository repository, PasswordEncoder encoder) {
        this.repository = repository;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        String email = "demo@universidade.edu";
        if (repository.findByEmail(email).isEmpty()) {
            Usuario u = new Usuario();
            u.setInstituicao("Universidade Federal");
            u.setTipo("Universidade");
            u.setEmail(email);
            u.setSenha(encoder.encode("123456"));
            repository.save(u);
        }
    }
}
