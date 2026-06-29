package com.example.emergencia.services;

import com.example.emergencia.entity.EntornoEntity;
import com.example.emergencia.exceptions.ResourceNotFoundException;
import com.example.emergencia.interfaces.IEntornoService;
import com.example.emergencia.repository.EntornoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EntornoServiceImpl implements IEntornoService {

    @Autowired
    private EntornoRepository entornoRepository;

    @Override
    public List<EntornoEntity> findAll() {
        return entornoRepository.findAll();
    }

    @Override
    public EntornoEntity findById(Long id) {
        return entornoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Entorno familiar no encontrado con ID: " + id));
    }

    @Override
    public EntornoEntity save(EntornoEntity entorno) {
        return entornoRepository.save(entorno);
    }

    @Override
    public EntornoEntity update(EntornoEntity entorno) {
        EntornoEntity existente = findById(entorno.getId());
        existente.setNombre(entorno.getNombre());
        existente.setParentesco(entorno.getParentesco());
        existente.setViveConUsuario(entorno.getViveConUsuario());
        existente.setPersonaSorda(entorno.getPersonaSorda());
        return entornoRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        EntornoEntity existente = findById(id);
        entornoRepository.delete(existente);
    }
}
