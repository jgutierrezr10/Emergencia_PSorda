package com.example.emergencia.services;

import com.example.emergencia.entity.PatrullaEntity;
import com.example.emergencia.exceptions.ResourceNotFoundException;
import com.example.emergencia.interfaces.IPatrullaService;
import com.example.emergencia.repository.PatrullaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatrullaServiceImpl implements IPatrullaService {

    @Autowired
    private PatrullaRepository patrullaRepository;

    @Override
    public List<PatrullaEntity> findAll() {
        return patrullaRepository.findAll();
    }

    @Override
    public PatrullaEntity findById(Long id) {
        return patrullaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patrulla no encontrada con ID: " + id));
    }

    @Override
    public PatrullaEntity save(PatrullaEntity patrulla) {
        return patrullaRepository.save(patrulla);
    }

    @Override
    public PatrullaEntity update(PatrullaEntity patrulla) {
        PatrullaEntity existente = findById(patrulla.getId());
        existente.setPatente(patrulla.getPatente());
        existente.setLongitudLatitud(patrulla.getLongitudLatitud());
        existente.setEstado(patrulla.getEstado());
        return patrullaRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        PatrullaEntity existente = findById(id);
        patrullaRepository.delete(existente);
    }
}
