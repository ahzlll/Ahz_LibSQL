package com.ahz.libsqlbackend.controller;

import com.ahz.libsqlbackend.entity.SysUser;
import com.ahz.libsqlbackend.repository.SysUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SysUserRepository sysUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(SysUserRepository sysUserRepository, PasswordEncoder passwordEncoder) {
        this.sysUserRepository = sysUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public static class LoginRequest {
        public String username;
        public String password;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        SysUser user = sysUserRepository.findByUsername(request.username).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("用户名或密码错误");
        }
        String encoded = user.getPasswordHash();
        if (!passwordEncoder.matches(request.password, encoded)) {
            return ResponseEntity.badRequest().body("用户名或密码错误");
        }
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("id", user.getId());
        result.put("username", user.getUsername());
        result.put("role", user.getRole());
        return ResponseEntity.ok(result);
    }
}


