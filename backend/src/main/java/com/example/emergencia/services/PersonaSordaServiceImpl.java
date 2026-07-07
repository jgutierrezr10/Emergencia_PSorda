package com.example.emergencia.services;

import com.example.emergencia.entity.PersonaSordaEntity;
import com.example.emergencia.exceptions.ResourceNotFoundException;
import com.example.emergencia.interfaces.IPersonaSordaService;
import com.example.emergencia.repository.PersonaSordaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PersonaSordaServiceImpl implements IPersonaSordaService {

    @Autowired
    private PersonaSordaRepository personaSordaRepository;

    @Override
    public List<PersonaSordaEntity> findAll() {
        return personaSordaRepository.findAll();
    }

    @Override
    public PersonaSordaEntity findById(Long id) {
        return personaSordaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Persona sorda no encontrada con ID: " + id));
    }

    @Override
    public PersonaSordaEntity save(PersonaSordaEntity personaSorda) {
        return personaSordaRepository.save(personaSorda);
    }

    @Override
    public PersonaSordaEntity update(PersonaSordaEntity personaSorda) {
        PersonaSordaEntity existente = findById(personaSorda.getId());
        existente.setDireccion(personaSorda.getDireccion());
        existente.setInfoMedica(personaSorda.getInfoMedica());
        existente.setUsuario(personaSorda.getUsuario());
        existente.setDocumentoValidacionUrl(personaSorda.getDocumentoValidacionUrl());
        return personaSordaRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        PersonaSordaEntity existente = findById(id);
        personaSordaRepository.delete(existente);
    }

    @Override
    public PersonaSordaEntity findByUsuarioRut(String rut) {
        return personaSordaRepository.findByUsuarioRut(rut)
                .orElseThrow(() -> new ResourceNotFoundException("Persona sorda no encontrada con RUT: " + rut));
    }
}
