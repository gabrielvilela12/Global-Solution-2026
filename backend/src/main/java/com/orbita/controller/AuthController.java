package com.orbita.controller;

import com.orbita.model.Usuario;
import com.orbita.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UsuarioService service;

    public AuthController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping("/usuarios")
    public ResponseEntity<?> cadastrar(@RequestBody Map<String, Object> body) {
        try {
            Usuario u = service.cadastrar(body);
            return ResponseEntity.status(HttpStatus.CREATED).body(u);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> body) {
        String email = body.getOrDefault("email", "").toString().trim();
        String senha = body.getOrDefault("senha", "").toString();
        try {
            Usuario u = service.autenticar(email, senha);

            // --- Ponto de extensão para 2FA (futuro) ---
            // Quando o 2FA for implementado:
            //   if (u.isTwoFactorEnabled()) {
            //       return ResponseEntity.ok(Map.of("requires2fa", true, "userId", u.getId()));
            //   }
            // e um endpoint /api/auth/2fa/verify validará o código antes de liberar o acesso.

            return ResponseEntity.ok(u);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", e.getMessage()));
        }
    }
}
