package com.example.emergencia.services;

import com.example.emergencia.entity.TriageAlertaEntity;
import com.example.emergencia.exceptions.ResourceNotFoundException;
import com.example.emergencia.interfaces.ITriageAlertaService;
import com.example.emergencia.repository.TriageAlertaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TriageAlertaServiceImpl implements ITriageAlertaService {

    @Autowired
    private TriageAlertaRepository triageAlertaRepository;

    @Override
    public List<TriageAlertaEntity> findAll() {
        return triageAlertaRepository.findAll();
    }

    @Override
    public TriageAlertaEntity findById(Long id) {
        return triageAlertaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Triage no encontrado con ID: " + id));
    }

    @Override
    public TriageAlertaEntity save(TriageAlertaEntity triageAlerta) {
        return triageAlertaRepository.save(triageAlerta);
    }

    @Override
    public TriageAlertaEntity update(TriageAlertaEntity triageAlerta) {
        TriageAlertaEntity existente = findById(triageAlerta.getId());
        existente.setPreguntaClave(triageAlerta.getPreguntaClave());
        existente.setRespuestaSordo(triageAlerta.getRespuestaSordo());
        existente.setHoraRespuesta(triageAlerta.getHoraRespuesta());
        existente.setAlerta(triageAlerta.getAlerta());
        return triageAlertaRepository.save(existente);
    }

    @Override
    public void delete(Long id) {
        TriageAlertaEntity existente = findById(id);
        triageAlertaRepository.delete(existente);
    }

    @Override
    public List<TriageAlertaEntity> findByAlertaId(Long alertaId) {
        return triageAlertaRepository.findByAlertaIdOrderByHoraRespuestaAsc(alertaId);
    }
}
