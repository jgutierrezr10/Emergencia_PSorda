package com.example.emergencia.services;

import com.example.emergencia.entity.DespachoEntity;
import com.example.emergencia.exceptions.ResourceNotFoundException;
import com.example.emergencia.interfaces.IDespachoService;
import com.example.emergencia.repository.DespachoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DespachoServiceImpl implements IDespachoService {

    @Autowired
    private DespachoRepository despachoRepository;

    @Override
    public List<DespachoEntity> findAll() {
        return despachoRepository.findAll();
    }

    @Override
    public DespachoEntity findById(Long id) {
        return despachoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Despacho no encontrado con ID: " + id));
    }

    @Override
    public DespachoEntity save(DespachoEntity despacho) {
        return despachoRepository.save(despacho);
    }

    @Override
    public DespachoEntity update(DespachoEntity despacho) {
        DespachoEntity existente = findById(despacho.getId());
        existente.setFechaHoraInicio(despacho.getFechaHoraInicio());
        existente.setFechaHoraLlegada(despacho.getFechaHoraLlegada());
        existente.setEstado(despacho.getEstado());
        existente.setPatrulla(despacho.getPatrulla());
        existente.setAlerta(despacho.getAlerta());
        return despachoRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        DespachoEntity existente = findById(id);
        despachoRepository.delete(existente);
    }

    @Override
    public List<DespachoEntity> findByAlertaId(Long alertaId) {
        return despachoRepository.findByAlertaId(alertaId);
    }
}
