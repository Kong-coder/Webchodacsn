package com.example.demo.controller;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.demo.dto.FacebookLoginRequest;
import com.example.demo.dto.GoogleLoginRequest;
import com.example.demo.dto.JwtResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${app.facebook.app-id}")
    private String facebookAppId;

    @Value("${app.facebook.app-secret}")
    private String facebookAppSecret;

    @Value("${app.facebook.redirect-callback:http://localhost/api/auth/facebook/callback}")
    private String facebookRedirectCallback;

    @Value("${app.frontend.redirect-after-login:http://frontend:80}")
    private String frontendRedirectAfterLogin;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse jwtResponse = authService.login(loginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        try {
            authService.register(registerRequest);
            return ResponseEntity.ok("User registered successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/google")
    public ResponseEntity<?> authenticateUserWithGoogle(@RequestBody GoogleLoginRequest googleLoginRequest) {
        try {
            JwtResponse jwtResponse = authService.loginWithGoogle(googleLoginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (GeneralSecurityException | IOException e) {
            return ResponseEntity.badRequest().body("Google authentication failed: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/facebook")
    public ResponseEntity<?> authenticateUserWithFacebook(@RequestBody FacebookLoginRequest facebookLoginRequest) {
        try {
            JwtResponse jwtResponse = authService.loginWithFacebook(facebookLoginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Facebook authentication failed: " + e.getMessage());
        }
    }

    @GetMapping("/facebook/login")
    public ResponseEntity<?> facebookLoginRedirect() {
        String dialog = UriComponentsBuilder
                .fromHttpUrl("https://www.facebook.com/v18.0/dialog/oauth")
                .queryParam("client_id", facebookAppId)
                .queryParam("redirect_uri", facebookRedirectCallback)
                .queryParam("scope", "email")
                .build(true)
                .toUriString();
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", dialog)
                .build();
    }

    @GetMapping("/facebook/callback")
    public ResponseEntity<?> facebookCallback(@RequestParam(name = "code", required = false) String code,
                                              @RequestParam(name = "error", required = false) String error,
                                              @RequestParam(name = "error_description", required = false) String errorDescription) {
        if (error != null) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendRedirectAfterLogin + "?error=" + error)
                    .build();
        }
        if (code == null || code.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendRedirectAfterLogin + "?error=missing_code")
                    .build();
        }

        // Exchange code for access_token
        String tokenUrl = UriComponentsBuilder
                .fromHttpUrl("https://graph.facebook.com/v18.0/oauth/access_token")
                .queryParam("client_id", facebookAppId)
                .queryParam("client_secret", facebookAppSecret)
                .queryParam("redirect_uri", facebookRedirectCallback)
                .queryParam("code", code)
                .build(true)
                .toUriString();

        Map<?, ?> tokenResp = restTemplate.getForObject(tokenUrl, Map.class);
        if (tokenResp == null || tokenResp.get("access_token") == null) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendRedirectAfterLogin + "?error=token_exchange_failed")
                    .build();
        }

        String accessToken = tokenResp.get("access_token").toString();
        // Reuse existing service to generate JWT and user
        FacebookLoginRequest req = new FacebookLoginRequest();
        req.setToken(accessToken);
        try {
            JwtResponse jwt = authService.loginWithFacebook(req);
            String redirect = UriComponentsBuilder.fromHttpUrl(frontendRedirectAfterLogin)
                    .queryParam("token", jwt.getToken())
                    .build(true)
                    .toUriString();
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", redirect)
                    .build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", frontendRedirectAfterLogin + "?error=auth_failed")
                    .build();
        }
    }
}