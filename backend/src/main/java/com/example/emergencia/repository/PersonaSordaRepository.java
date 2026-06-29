package com.example.emergencia.repository;

import com.example.emergencia.entity.PersonaSordaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonaSordaRepository extends JpaRepository<PersonaSordaEntity, Long> {
    Optional<PersonaSordaEntity> findByUsuarioRut(String rut);
}
