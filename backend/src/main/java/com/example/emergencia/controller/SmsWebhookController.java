package com.example.emergencia.controller;

import com.example.emergencia.dto.SmsGatewayRequest;
import com.example.emergencia.entity.AlertaEntity;
import com.example.emergencia.interfaces.IAlertaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sms")
@CrossOrigin(origins = "*")
public class SmsWebhookController {

    @Autowired
    private IAlertaService alertaService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleSmsWebhook(@RequestBody SmsGatewayRequest request) {
        String message = request.getMessage();
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Mensaje vacío");
        }

        // Formato esperado: ALERTA RUT LAT LON
        // Ejemplo: ALERTA 12345678-9 -33.456 -70.654
        String[] parts = message.trim().split("\\s+");
        
        if (parts.length >= 4 && parts[0].equalsIgnoreCase("ALERTA")) {
            String rut = parts[1];
            String lat = parts[2];
            String lon = parts[3];
            String latitudLongitud = lat + "," + lon;

            try {
                // Usamos el servicio existente para crear la alerta por RUT
                AlertaEntity saved = alertaService.crearAlertaPorRut(rut, latitudLongitud);
                
                // Marcamos el incidente como SMS Offline para que el frontend lo sepa
                saved.setIncidente("SMS_OFFLINE");
                alertaService.update(saved); // Guardamos la actualización

                // Notificar vía WebSockets al panel de CENCO
                messagingTemplate.convertAndSend("/topic/alertas", saved);

                return ResponseEntity.ok("Alerta procesada correctamente");
            } catch (Exception e) {
                // En caso de que el RUT no exista o haya un error
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error al procesar la alerta: " + e.getMessage());
            }
        }

        return ResponseEntity.badRequest().body("Formato de SMS no reconocido");
    }
}
