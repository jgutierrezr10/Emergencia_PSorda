INSERT INTO usuarios (nombre, apellido, telefono, rut, clave, estado, rol) VALUES
('Juan', 'Perez', '987654321', '12345678-9', '$2a$10$RR6E18EqG38seiGsJQPqeOTpRIaPNb0Vs40n/OvewLclsUErB6YyO', 'Activo', 'Carabinero'),
('Maria', 'Gomez', '912345678', '67676767-6', '$2a$10$RR6E18EqG38seiGsJQPqeOTpRIaPNb0Vs40n/OvewLclsUErB6YyO', 'Activo', 'Sordo') 
ON CONFLICT (rut) DO UPDATE SET rol = EXCLUDED.rol;

INSERT INTO comisarias (nombre, direccion)
SELECT '1ra Comisaría de Santiago', 'Santo Domingo 123'
WHERE NOT EXISTS (
    SELECT 1 FROM comisarias WHERE nombre = '1ra Comisaría de Santiago'
);

INSERT INTO carabineros (nombre, numero, rango, comisaria_id, usuario_id)
SELECT 'Juan Perez', 133, 'Cabo', (SELECT id FROM comisarias WHERE nombre = '1ra Comisaría de Santiago'), id FROM usuarios WHERE rut = '12345678-9'
AND NOT EXISTS (
    SELECT 1 FROM carabineros 
    WHERE usuario_id = (SELECT id FROM usuarios WHERE rut = '12345678-9')
);

INSERT INTO personas_sordas (direccion, info_medica, usuario_id)
SELECT 'Calle Falsa 123', 'Alergia a la penicilina', id FROM usuarios WHERE rut = '67676767-6'
AND NOT EXISTS (
    SELECT 1 FROM personas_sordas 
    WHERE usuario_id = (SELECT id FROM usuarios WHERE rut = '67676767-6')
);