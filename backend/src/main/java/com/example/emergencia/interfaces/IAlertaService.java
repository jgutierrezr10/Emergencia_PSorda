package com.example.emergencia.interfaces;

import com.example.emergencia.entity.AlertaEntity;
import java.util.List;

public interface IAlertaService {
    List<AlertaEntity> findAll();
    AlertaEntity findById(Long id);
    AlertaEntity save(AlertaEntity alerta);
    AlertaEntity update(AlertaEntity alerta);
    void delete(Long id);
    AlertaEntity crearAlertaPorRut(String rut, String latitudLongitud);
}
