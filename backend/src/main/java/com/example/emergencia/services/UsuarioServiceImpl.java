package com.example.emergencia.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.emergencia.entity.UsuarioEntity;
import com.example.emergencia.interfaces.IUsuarioService;
import com.example.emergencia.repository.UsuarioRepository;
import com.example.emergencia.exceptions.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Service
public class UsuarioServiceImpl implements IUsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<UsuarioEntity> findAll() {
        return usuarioRepository.findAll();
    }

    @Override
    public UsuarioEntity findById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
    }

    @Override
    public UsuarioEntity save(UsuarioEntity usuario) {
        usuario.setClave(passwordEncoder.encode(usuario.getClave()));
        return usuarioRepository.save(usuario);
    }

    @Override
    public UsuarioEntity update(UsuarioEntity usuario) {
        UsuarioEntity existente = findById(usuario.getId());
        existente.setNombre(usuario.getNombre());
        existente.setApellido(usuario.getApellido());
        existente.setTelefono(usuario.getTelefono());
        existente.setRut(usuario.getRut());
        
        if (usuario.getClave() != null && !usuario.getClave().isEmpty() && !usuario.getClave().equals(existente.getClave())) {
            existente.setClave(passwordEncoder.encode(usuario.getClave()));
        }
        
        existente.setEstado(usuario.getEstado());
        existente.setRol(usuario.getRol());
        return usuarioRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        UsuarioEntity existente = findById(id);
        usuarioRepository.delete(existente);
    }

    @Override
    public UsuarioEntity findByRut(String rut) {
        return usuarioRepository.findByRut(rut)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con RUT: " + rut));
    }

    @Override
    public List<UsuarioEntity> findByEstado(String estado) {
        return usuarioRepository.findByEstado(estado);
    }
}
