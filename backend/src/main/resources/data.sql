INSERT INTO roles (nombre_rol, estado_rol) VALUES ('Administrador', 'Activo'), ('Sordo', 'Activo'), ('Carabinero', 'Activo'); 

INSERT INTO usuarios (nombre, apellido, telefono, rut, clave, estado, rol_id) VALUES
('Juan', 'Perez', '987654321', '12345678-9', '$2a$10$RR6E18EqG38seiGsJQPqeOTpRIaPNb0Vs40n/OvewLclsUErB6YyO', 'Activo', 3),
('Maria', 'Gomez', '912345678', '67676767-6', '$2a$10$RR6E18EqG38seiGsJQPqeOTpRIaPNb0Vs40n/OvewLclsUErB6YyO', 'Activo', 2); 