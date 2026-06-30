package com.example.emergencia.services;

import com.example.emergencia.entity.AlertaEntity;
import com.example.emergencia.exceptions.ResourceNotFoundException;
import com.example.emergencia.interfaces.IAlertaService;
import com.example.emergencia.repository.AlertaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertaServiceImpl implements IAlertaService {

    @Autowired
    private AlertaRepository alertaRepository;

    @Override
    public List<AlertaEntity> findAll() {
        return alertaRepository.findAll();
    }

    @Override
    public AlertaEntity findById(Long id) {
        return alertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerta no encontrada con ID: " + id));
    }

    @Override
    public AlertaEntity save(AlertaEntity alerta) {
        if (alerta.getId() == null) {
            alerta.setFechaHoraInicio(java.time.LocalDateTime.now());
        }
        return alertaRepository.save(alerta);
    }

    @Override
    public AlertaEntity update(AlertaEntity alerta) {
        AlertaEntity existente = findById(alerta.getId());
        existente.setFechaHoraInicio(alerta.getFechaHoraInicio());
        existente.setLatitudLongitud(alerta.getLatitudLongitud());
        existente.setDisponibleTriage(alerta.getDisponibleTriage());
        existente.setEstado(alerta.getEstado());
        existente.setPersonaSorda(alerta.getPersonaSorda());
        existente.setNotasOperador(alerta.getNotasOperador());
        return alertaRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        AlertaEntity existente = findById(id);
        alertaRepository.delete(existente);
    }

    @Autowired
    private com.example.emergencia.repository.PersonaSordaRepository personaSordaRepository;

    @Override
    public AlertaEntity crearAlertaPorRut(String rut, String latitudLongitud) {
        com.example.emergencia.entity.PersonaSordaEntity persona = personaSordaRepository.findByUsuarioRut(rut)
                .orElseThrow(() -> new ResourceNotFoundException("Persona sorda no encontrada para el RUT: " + rut));

        AlertaEntity alerta = new AlertaEntity();
        alerta.setFechaHoraInicio(java.time.LocalDateTime.now());
        alerta.setLatitudLongitud(latitudLongitud);
        alerta.setDisponibleTriage(true); // Estará disponible para triage a continuación
        alerta.setEstado("CREADA");
        alerta.setPersonaSorda(persona);

        return alertaRepository.save(alerta);
    }
}
