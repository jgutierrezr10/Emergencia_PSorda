package com.example.emergencia.config;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import com.example.emergencia.entity.UsuarioEntity;
import com.example.emergencia.repository.UsuarioRepository;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String rut;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            rut = jwtUtil.extractRut(jwt);
            if (rut != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtUtil.validateToken(jwt, rut)) {
                    // Single Session validation
                    Optional<UsuarioEntity> optUser = usuarioRepository.findByRut(rut);
                    if (optUser.isPresent()) {
                        UsuarioEntity user = optUser.get();
                        Long dbVersion = user.getTokenVersion() == null ? 0L : user.getTokenVersion();
                        Long jwtVersion = jwtUtil.extractTokenVersion(jwt);
                        if (!dbVersion.equals(jwtVersion)) {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Session expired or logged in from another device");
                            return;
                        }
                    }

                    Claims claims = jwtUtil.extractAllClaims(jwt);
                    String rol = claims.get("rol", String.class);
                    
                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                            new SimpleGrantedAuthority("ROLE_" + rol)
                    );

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            rut,
                            null,
                            authorities
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            logger.error("Token processing error: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
