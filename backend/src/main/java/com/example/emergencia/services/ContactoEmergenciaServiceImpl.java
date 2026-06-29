package com.example.emergencia.services;

import com.example.emergencia.entity.ContactoEmergenciaEntity;
import com.example.emergencia.exceptions.ResourceNotFoundException;
import com.example.emergencia.interfaces.IContactoEmergenciaService;
import com.example.emergencia.repository.ContactoEmergenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactoEmergenciaServiceImpl implements IContactoEmergenciaService {

    @Autowired
    private ContactoEmergenciaRepository contactoRepository;

    @Override
    public List<ContactoEmergenciaEntity> findAll() {
        return contactoRepository.findAll();
    }

    @Override
    public ContactoEmergenciaEntity findById(Long id) {
        return contactoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contacto de emergencia no encontrado con ID: " + id));
    }

    @Override
    public ContactoEmergenciaEntity save(ContactoEmergenciaEntity contacto) {
        return contactoRepository.save(contacto);
    }

    @Override
    public ContactoEmergenciaEntity update(ContactoEmergenciaEntity contacto) {
        ContactoEmergenciaEntity existente = findById(contacto.getId());
        existente.setNombre(contacto.getNombre());
        existente.setNumero(contacto.getNumero());
        existente.setPersonaSorda(contacto.getPersonaSorda());
        return contactoRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        ContactoEmergenciaEntity existente = findById(id);
        contactoRepository.delete(existente);
    }

    @Autowired
    private com.example.emergencia.repository.PersonaSordaRepository personaSordaRepository;

    @Override
    public List<ContactoEmergenciaEntity> buscarPorRut(String rut) {
        return contactoRepository.findByPersonaSordaUsuarioRut(rut);
    }

    @Override
    public ContactoEmergenciaEntity crearParaRut(String rut, ContactoEmergenciaEntity contacto) {
        com.example.emergencia.entity.PersonaSordaEntity persona = personaSordaRepository.findByUsuarioRut(rut)
                .orElseThrow(() -> new ResourceNotFoundException("Persona sorda no encontrada para el RUT: " + rut));
        
        contacto.setPersonaSorda(persona);
        return contactoRepository.save(contacto);
    }
}
