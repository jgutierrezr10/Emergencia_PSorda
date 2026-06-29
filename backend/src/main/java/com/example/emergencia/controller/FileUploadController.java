package com.example.emergencia.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads";

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo está vacío"));
        }

        try {
            // Asegurar que la carpeta de destino existe
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Generar nombre de archivo único
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueName = UUID.randomUUID().toString() + fileExtension;
            
            // Guardar el archivo físicamente
            Path path = Paths.get(UPLOAD_DIR, uniqueName);
            Files.copy(file.getInputStream(), path);

            // Generar la URL dinámica basada en el host del cliente que realiza la petición
            String requestUrl = request.getRequestURL().toString();
            String baseUrl = requestUrl.substring(0, requestUrl.indexOf("/api/uploads"));
            String fileUrl = baseUrl + "/uploads/" + uniqueName;

            Map<String, String> response = new HashMap<>();
            response.put("fileName", originalFilename);
            response.put("fileUrl", fileUrl);
            response.put("fileType", file.getContentType());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al guardar el archivo: " + e.getMessage()));
        }
    }
}
