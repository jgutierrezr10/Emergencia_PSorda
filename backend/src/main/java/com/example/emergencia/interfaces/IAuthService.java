package com.example.emergencia.interfaces;

import com.example.emergencia.dto.LoginRequest;
import com.example.emergencia.dto.LoginResponse;

public interface IAuthService {
    LoginResponse login(LoginRequest request);
}
