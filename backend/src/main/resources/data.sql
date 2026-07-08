INSERT INTO usuarios (nombre, apellido, telefono, rut, clave, estado, rol) VALUES
('Juan', 'Perez', '987654321', '12345678-9', '$2a$10$RR6E18EqG38seiGsJQPqeOTpRIaPNb0Vs40n/OvewLclsUErB6YyO', 'Activo', 'Carabinero'),
('Maria', 'Gomez', '912345678', '67676767-6', '$2a$10$RR6E18EqG38seiGsJQPqeOTpRIaPNb0Vs40n/OvewLclsUErB6YyO', 'Activo', 'Sordo'),
('Pedro', 'Rodriguez', '999888777', '22222222-2', '$2a$10$RR6E18EqG38seiGsJQPqeOTpRIaPNb0Vs40n/OvewLclsUErB6YyO', 'Activo', 'Carabinero')
ON CONFLICT (rut) DO UPDATE SET rol = EXCLUDED.rol;

INSERT INTO carabineros (nombre, numero, rango, comisaria_id, usuario_id)
SELECT 'Juan Perez', 133, 'Cabo', 1, id FROM usuarios WHERE rut = '12345678-9'
AND NOT EXISTS (
    SELECT 1 FROM carabineros 
    WHERE usuario_id = (SELECT id FROM usuarios WHERE rut = '12345678-9')
);

INSERT INTO carabineros (nombre, numero, rango, comisaria_id, usuario_id)
SELECT 'Pedro Rodriguez', 133, 'Sargento', 1, id FROM usuarios WHERE rut = '22222222-2'
AND NOT EXISTS (
    SELECT 1 FROM carabineros 
    WHERE usuario_id = (SELECT id FROM usuarios WHERE rut = '22222222-2')
);

INSERT INTO personas_sordas (direccion, info_medica, latitud_casa, longitud_casa, nombre_referencia_casa, usuario_id)
SELECT 'Calle Falsa 123', 'Alergia a la penicilina', '-33.4372', '-70.6506', 'Mi Casa', id FROM usuarios WHERE rut = '67676767-6'
AND NOT EXISTS (
    SELECT 1 FROM personas_sordas
    WHERE usuario_id = (SELECT id FROM usuarios WHERE rut = '67676767-6')
);

INSERT INTO alertas (fecha_hora_inicio, latitud_longitud, estado, incidente, persona_sorda_id, disponible_triage, modo_camuflaje, notas_operador)
SELECT '2026-07-07 10:00:00', '-33.4372,-70.6506', 'Finalizada', 'Robo a mano armada', id, true, false, 'Se despachó patrulla y se controló la situación.'
FROM personas_sordas WHERE usuario_id = (SELECT id FROM usuarios WHERE rut = '67676767-6')
AND NOT EXISTS (
    SELECT 1 FROM alertas WHERE estado = 'Finalizada'
);