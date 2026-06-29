package com.example.emergencia.services;

import com.example.emergencia.config.JwtUtil;
import com.example.emergencia.dto.LoginRequest;
import com.example.emergencia.dto.LoginResponse;
import com.example.emergencia.entity.UsuarioEntity;
import com.example.emergencia.entity.PersonaSordaEntity;
import com.example.emergencia.interfaces.IAuthService;
import com.example.emergencia.repository.UsuarioRepository;
import com.example.emergencia.repository.PersonaSordaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthServiceImpl implements IAuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PersonaSordaRepository personaSordaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public LoginResponse login(LoginRequest request) {
        // Limpia el RUT quitando puntos y pasándolo a mayúsculas
        String rutLimpio = request.getRut().replace(".", "").toUpperCase();

        // Busca al usuario por su RUT limpio
        UsuarioEntity usuario = usuarioRepository.findByRut(rutLimpio)
                .orElseThrow(() -> new BadCredentialsException("RUT o clave única incorrectos"));

        // Verifica contraseña
        if (!passwordEncoder.matches(request.getClave(), usuario.getClave())) {
            throw new BadCredentialsException("RUT o clave única incorrectos");
        }

        // Obtiene el rol (en caso de que sea null, enviamos "Desconocido")
        String rol = (usuario.getRol() != null && !usuario.getRol().isEmpty()) ? usuario.getRol() : "Desconocido";
        String nombreCompleto = usuario.getNombre() + " " + usuario.getApellido();

        // Obtener personaSordaId si es Sordo
        Long personaSordaId = null;
        if ("Sordo".equals(rol)) {
            Optional<PersonaSordaEntity> ps = personaSordaRepository.findByUsuarioId(usuario.getId());
            if (ps.isPresent()) {
                personaSordaId = ps.get().getId();
            }
        }

        // Genera Token JWT
        String token = jwtUtil.generateToken(usuario.getRut(), rol);

        // Retorna la respuesta con el Token, Rut, Rol, UsuarioId y PersonaSordaId
        return new LoginResponse(token, usuario.getRut(), nombreCompleto, rol, usuario.getId(), personaSordaId);
    }
}
