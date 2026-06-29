package com.example.emergencia.interfaces;

import com.example.emergencia.entity.PersonaSordaEntity;
import java.util.List;

public interface IPersonaSordaService {
    List<PersonaSordaEntity> findAll();
    PersonaSordaEntity findById(Long id);
    PersonaSordaEntity save(PersonaSordaEntity personaSorda);
    PersonaSordaEntity update(PersonaSordaEntity personaSorda);
    void delete(Long id);
    PersonaSordaEntity findByUsuarioRut(String rut);
}
