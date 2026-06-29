package com.example.emergencia.interfaces;

import com.example.emergencia.entity.TriageAlertaEntity;
import java.util.List;

public interface ITriageAlertaService {
    List<TriageAlertaEntity> findAll();
    TriageAlertaEntity findById(Long id);
    TriageAlertaEntity save(TriageAlertaEntity triageAlerta);
    TriageAlertaEntity update(TriageAlertaEntity triageAlerta);
    void delete(Long id);
    List<TriageAlertaEntity> findByAlertaId(Long alertaId);
    void guardarRespuestas(com.example.emergencia.dto.TriageRequest request);
}
