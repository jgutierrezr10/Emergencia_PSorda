package com.example.emergencia.interfaces;

import com.example.emergencia.entity.ContactoEmergenciaEntity;
import java.util.List;

public interface IContactoEmergenciaService {
    List<ContactoEmergenciaEntity> findAll();
    ContactoEmergenciaEntity findById(Long id);
    ContactoEmergenciaEntity save(ContactoEmergenciaEntity contacto);
    ContactoEmergenciaEntity update(ContactoEmergenciaEntity contacto);
    void delete(Long id);
    List<ContactoEmergenciaEntity> buscarPorRut(String rut);
    ContactoEmergenciaEntity crearParaRut(String rut, ContactoEmergenciaEntity contacto);
}
