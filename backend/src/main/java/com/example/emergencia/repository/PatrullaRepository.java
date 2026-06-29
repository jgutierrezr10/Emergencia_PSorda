package com.example.emergencia.repository;

import com.example.emergencia.entity.PatrullaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatrullaRepository extends JpaRepository<PatrullaEntity, Long> {
}
