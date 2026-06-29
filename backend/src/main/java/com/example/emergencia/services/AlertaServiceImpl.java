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
        return alertaRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        AlertaEntity existente = findById(id);
        alertaRepository.delete(existente);
    }
}
