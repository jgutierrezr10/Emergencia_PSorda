package com.example.emergencia.services;

import com.example.emergencia.config.JwtUtil;
import com.example.emergencia.dto.LoginRequest;
import com.example.emergencia.dto.LoginResponse;
import com.example.emergencia.entity.UsuarioEntity;
import com.example.emergencia.interfaces.IAuthService;
import com.example.emergencia.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements IAuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public LoginResponse login(LoginRequest request) {
        // Busca al usuario por su RUT
        UsuarioEntity usuario = usuarioRepository.findByRut(request.getRut())
                .orElseThrow(() -> new BadCredentialsException("RUT o clave única incorrectos"));

        // Verifica contraseña
        if (!passwordEncoder.matches(request.getClave(), usuario.getClave())) {
            throw new BadCredentialsException("RUT o clave única incorrectos");
        }

        // Obtiene el rol (en caso de que sea null, enviamos "Desconocido")
        String rol = (usuario.getRol() != null) ? usuario.getRol().getNombreRol() : "Desconocido";
        String nombreCompleto = usuario.getNombre() + " " + usuario.getApellido();

        // Genera Token JWT
        String token = jwtUtil.generateToken(usuario.getRut(), rol);

        // Retorna la respuesta con el Token, Rut y Rol
        return new LoginResponse(token, usuario.getRut(), nombreCompleto, rol);
    }
}
