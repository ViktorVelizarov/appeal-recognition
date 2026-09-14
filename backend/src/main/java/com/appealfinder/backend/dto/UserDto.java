package com.appealfinder.backend.dto;

import com.appealfinder.backend.model.User;

public record UserDto(String id, String email, String name) {
    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getName());
    }
}
