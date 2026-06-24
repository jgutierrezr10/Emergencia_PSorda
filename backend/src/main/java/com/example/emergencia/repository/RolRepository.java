package com.example.emergencia.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.emergencia.entity.RolEntity;

@Repository
public interface RolRepository extends JpaRepository<RolEntity, Long> {

}
