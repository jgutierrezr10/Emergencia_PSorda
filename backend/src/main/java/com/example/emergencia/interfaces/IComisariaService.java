package com.example.emergencia.interfaces;

import com.example.emergencia.entity.ComisariaEntity;
import java.util.List;

public interface IComisariaService {
    List<ComisariaEntity> findAll();
    ComisariaEntity findById(Long id);
    ComisariaEntity save(ComisariaEntity comisaria);
    ComisariaEntity update(ComisariaEntity comisaria);
    void delete(Long id);
}
