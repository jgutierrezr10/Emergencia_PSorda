package com.example.emergencia.repository;

import com.example.emergencia.entity.EntornoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntornoRepository extends JpaRepository<EntornoEntity, Long> {
    List<EntornoEntity> findByPersonaSordaUsuarioRut(String rut);
}
