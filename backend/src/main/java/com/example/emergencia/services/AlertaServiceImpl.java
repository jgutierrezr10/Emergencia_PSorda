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
        if ("Finalizada".equals(alerta.getEstado()) && existente.getFechaHoraFin() == null) {
            existente.setFechaHoraFin(java.time.LocalDateTime.now());
        }
        existente.setPersonaSorda(alerta.getPersonaSorda());
        // Solo pisar las notas si el request las trae: la app movil y otros flujos
        // hacen PUT de la alerta completa (estado, GPS, triage) sin conocer las notas
        // del operador, y al venir null las borraban de la base.
        if (alerta.getNotasOperador() != null) {
            existente.setNotasOperador(alerta.getNotasOperador());
        }
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

        // Anti-Spam: Verificar si ya tiene una alerta activa (que no sea Finalizada)
        List<AlertaEntity> alertas = alertaRepository.findAll();
        for (AlertaEntity a : alertas) {
            if (a.getPersonaSorda() != null 
                && a.getPersonaSorda().getId().equals(persona.getId())
                && !"Finalizada".equalsIgnoreCase(a.getEstado())) {
                // Ya existe una alerta activa, en lugar de crear otra, retornamos la existente
                return a;
            }
        }

        AlertaEntity alerta = new AlertaEntity();
        alerta.setFechaHoraInicio(java.time.LocalDateTime.now());
        alerta.setLatitudLongitud(latitudLongitud);
        alerta.setDisponibleTriage(true); // Estará disponible para triage a continuación
        alerta.setEstado("CREADA");
        alerta.setPersonaSorda(persona);

        return alertaRepository.save(alerta);
    }
}
