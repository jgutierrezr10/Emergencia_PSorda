package com.example.emergencia.repository;

import com.example.emergencia.entity.ContactoEmergenciaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactoEmergenciaRepository extends JpaRepository<ContactoEmergenciaEntity, Long> {
    List<ContactoEmergenciaEntity> findByPersonaSordaUsuarioRut(String rut);
}
