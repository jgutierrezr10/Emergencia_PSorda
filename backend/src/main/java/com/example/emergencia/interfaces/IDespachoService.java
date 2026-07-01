package com.example.emergencia.interfaces;

import com.example.emergencia.entity.DespachoEntity;
import java.util.List;

public interface IDespachoService {
    List<DespachoEntity> findAll();
    DespachoEntity findById(Long id);
    DespachoEntity save(DespachoEntity despacho);
    DespachoEntity update(DespachoEntity despacho);
    void delete(Long id);
    List<DespachoEntity> findByAlertaId(Long alertaId);
}
