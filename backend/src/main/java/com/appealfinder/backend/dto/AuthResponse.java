package com.appealfinder.backend.dto;

public record AuthResponse(String token, UserDto user) {
}
