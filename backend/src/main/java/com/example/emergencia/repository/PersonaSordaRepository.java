package com.example.emergencia.repository;

import com.example.emergencia.entity.PersonaSordaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import java.util.Optional;

@Repository
public interface PersonaSordaRepository extends JpaRepository<PersonaSordaEntity, Long> {
<<<<<<< HEAD
    Optional<PersonaSordaEntity> findByUsuarioId(Long usuarioId);
=======
    Optional<PersonaSordaEntity> findByUsuarioRut(String rut);
>>>>>>> 5fdda3528036052f36eb6a751fc9ee7f5f78c92e
}
