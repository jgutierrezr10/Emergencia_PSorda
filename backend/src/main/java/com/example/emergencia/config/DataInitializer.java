package com.example.emergencia.config;

import com.example.emergencia.entity.RolEntity;
import com.example.emergencia.entity.UsuarioEntity;
import com.example.emergencia.repository.RolRepository;
import com.example.emergencia.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Solo crear datos si la base de datos está vacía
        if (rolRepository.count() == 0) {
            RolEntity rolCarabinero = new RolEntity(null, "Carabinero", "Activo");
            RolEntity rolSordo = new RolEntity(null, "Sordo", "Activo");

            rolCarabinero = rolRepository.save(rolCarabinero);
            rolSordo = rolRepository.save(rolSordo);

            // Crea un Carabinero de prueba
            UsuarioEntity carabinero = new UsuarioEntity(
                    null,
                    "Juan",
                    "Perez",
                    "987654321",
                    "12345678-9",
                    passwordEncoder.encode("admin123"),
                    "Activo",
                    rolCarabinero);
            usuarioRepository.save(carabinero);

            // Crea un Sordo de prueba
            UsuarioEntity sordo = new UsuarioEntity(
                    null,
                    "Maria",
                    "Gomez",
                    "912345678",
                    "98765432-1",
                    passwordEncoder.encode("user123"),
                    "Activo",
                    rolSordo);
            usuarioRepository.save(sordo);

            System.out.println("=== DATOS DE PRUEBA CREADOS ===");
            System.out.println("Carabinero: RUT: 12345678-9 | Clave: admin123");
            System.out.println("Sordo: RUT: 98765432-1 | Clave: user123");
            System.out.println("===============================");
        }
    }
}
