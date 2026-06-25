package com.example.emergencia.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.emergencia.entity.RolEntity;
import com.example.emergencia.interfaces.IRolService;
import com.example.emergencia.repository.RolRepository;
import com.example.emergencia.exceptions.ResourceNotFoundException;

@Service
public class RolServiceImpl implements IRolService {

    @Autowired
    private RolRepository rolRepository;

    @Override
    public List<RolEntity> findAll() {
        return rolRepository.findAll();
    }

    @Override
    public RolEntity findById(Long id) {
        return rolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con ID: " + id));
    }

    @Override
    public RolEntity save(RolEntity rol) {
        return rolRepository.save(rol);
    }

    @Override
    public RolEntity update(RolEntity rol) {
        RolEntity existente = findById(rol.getId());
        existente.setNombreRol(rol.getNombreRol());
        existente.setEstadoRol(rol.getEstadoRol());
        return rolRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        RolEntity existente = findById(id);
        rolRepository.delete(existente);
    }

}
