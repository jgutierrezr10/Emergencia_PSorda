package com.example.emergencia.repository;

import com.example.emergencia.entity.CatalogoGifEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CatalogoGifRepository extends JpaRepository<CatalogoGifEntity, Long> {
}
