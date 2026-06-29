package com.example.emergencia.interfaces;

import com.example.emergencia.entity.EntornoEntity;
import java.util.List;

public interface IEntornoService {
    List<EntornoEntity> findAll();
    EntornoEntity findById(Long id);
    EntornoEntity save(EntornoEntity entorno);
    EntornoEntity update(EntornoEntity entorno);
    void delete(Long id);
    List<EntornoEntity> buscarPorRut(String rut);
    EntornoEntity crearParaRut(String rut, EntornoEntity entorno);
}
