package com.example.demo.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.example.demo.Security.JwtUtils;
import com.example.demo.dto.FacebookLoginRequest;
import com.example.demo.dto.FacebookUser;
import com.example.demo.dto.GoogleLoginRequest;
import com.example.demo.dto.JwtResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.model.NguoiDung;
import com.example.demo.model.VaiTro;
import com.example.demo.repository.NguoiDungRepository;
import com.example.demo.repository.VaiTroRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private VaiTroRepository vaiTroRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private KhachHangService khachHangService;

    @Value("${app.google.clientId}")
    private String googleClientId;

    @Value("${app.facebook.app-id}")
    private String facebookAppId;

    @Value("${app.facebook.app-secret}")
    private String facebookAppSecret;

        public JwtResponse login(LoginRequest loginRequest) {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
    
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Get actual role name from database instead of Spring Security authorities
            NguoiDung nguoiDung = nguoiDungRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<String> roles = new ArrayList<>();
            if (nguoiDung.getVaiTro() != null) {
                roles.add(nguoiDung.getVaiTro().getTenVaiTro());
            }
    
            String birthDate = (userDetails.getBirthDate() != null) ? userDetails.getBirthDate().toString() : null;

            return new JwtResponse(jwt, 
                                     userDetails.getId(), 
                                     userDetails.getUsername(), 
                                     userDetails.getEmail(), 
                                     userDetails.getFullName(),
                                     userDetails.getPhone(),
                                     roles, 
                                     userDetails.getAddress(),
                                     birthDate);
        }
    @Transactional
    public NguoiDung register(RegisterRequest registerRequest) {
        if (nguoiDungRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        if (nguoiDungRepository.findByTenDangNhap(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        NguoiDung newUser = new NguoiDung();
        newUser.setHoTen(registerRequest.getFullName());
        newUser.setEmail(registerRequest.getEmail());
        newUser.setSoDienThoai(registerRequest.getPhone());
        newUser.setMatKhauBam(passwordEncoder.encode(registerRequest.getPassword()));
        newUser.setTenDangNhap(registerRequest.getEmail());
        
        VaiTro userRole = vaiTroRepository.findByTenVaiTro("KhachHang")
                .orElseThrow(() -> new RuntimeException("Error: Default role ROLE_CUSTOMER was not found in the database."));
        newUser.setVaiTro(userRole);
        
        newUser.setNgayTao(OffsetDateTime.now());
        newUser.setDangHoatDong(true);

        NguoiDung savedUser = nguoiDungRepository.save(newUser);
        
        // Auto-sync to khach_hang table
        try {
            khachHangService.syncCustomerFromNguoiDung(savedUser.getMaNguoiDung());
        } catch (Exception e) {
            logger.error("Failed to sync customer to khach_hang table", e);
        }
        
        return savedUser;
    }

    public JwtResponse loginWithGoogle(GoogleLoginRequest googleLoginRequest) throws GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
            new NetHttpTransport(),
            new com.google.api.client.json.gson.GsonFactory())
            .setAudience(Collections.singletonList(googleClientId))
            .build();

        GoogleIdToken idToken = verifier.verify(googleLoginRequest.getToken());
        if (idToken == null) {
            throw new IllegalArgumentException("Invalid Google ID token.");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String name = (String) payload.get("name");

        NguoiDung nguoiDung = processUserAfterGoogleLogin(email, name);

        UserDetailsImpl userDetails = UserDetailsImpl.build(nguoiDung);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        // Get actual role name from database instead of Spring Security authorities
        List<String> roles = new ArrayList<>();
        if (nguoiDung.getVaiTro() != null) {
            roles.add(nguoiDung.getVaiTro().getTenVaiTro());
        }

        String birthDate = (nguoiDung.getNgaySinh() != null) ? nguoiDung.getNgaySinh().toString() : null;

        return new JwtResponse(jwt, 
                                userDetails.getId(), 
                                userDetails.getUsername(), 
                                userDetails.getEmail(), 
                                nguoiDung.getHoTen(), 
                                nguoiDung.getSoDienThoai(), 
                                roles, 
                                nguoiDung.getDiaChi(), 
                                birthDate);
    }

    private NguoiDung processUserAfterGoogleLogin(String email, String name) {
        Optional<NguoiDung> userOptional = nguoiDungRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            NguoiDung existingUser = userOptional.get();
            if (!existingUser.isDangHoatDong()) {
                throw new RuntimeException("User is blocked");
            }
            return existingUser;
        } else {
            NguoiDung newUser = new NguoiDung();
            newUser.setEmail(email);
            newUser.setTenDangNhap(email); // Use email as username
            newUser.setHoTen(name);
            // Generate a random secure password as it won't be used for login
            newUser.setMatKhauBam(passwordEncoder.encode(UUID.randomUUID().toString()));
            
            VaiTro userRole = vaiTroRepository.findByTenVaiTro("KhachHang") // Default customer role
                    .orElseThrow(() -> new RuntimeException("Error: Default role ROLE_CUSTOMER was not found."));
            newUser.setVaiTro(userRole);
            
            newUser.setDangHoatDong(true);
            newUser.setNgayTao(OffsetDateTime.now());
            
            NguoiDung savedUser = nguoiDungRepository.save(newUser);
            
            // Auto-sync to khach_hang table
            try {
                khachHangService.syncCustomerFromNguoiDung(savedUser.getMaNguoiDung());
            } catch (Exception e) {
                logger.error("Failed to sync Google user to khach_hang table", e);
            }
            
            return savedUser;
        }
    }

    public JwtResponse loginWithFacebook(FacebookLoginRequest facebookLoginRequest) {
        logger.info("Attempting Facebook login via Graph API");
        String accessToken = facebookLoginRequest.getToken();
        String appSecretProof = generateAppSecretProof(accessToken);
        String url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + accessToken + "&appsecret_proof=" + appSecretProof;

        FacebookUser facebookUser;
        try {
            facebookUser = restTemplate.getForObject(url, FacebookUser.class);
            logger.info("Successfully received user info from Facebook");
        } catch (Exception e) {
            logger.error("Error while calling Facebook Graph API", e);
            throw e; // re-throw exception to be handled by controller
        }

        if (facebookUser == null) {
            logger.error("Facebook user info is null after API call.");
            throw new RuntimeException("Failed to get user info from Facebook");
        }
        if (facebookUser.getEmail() == null || facebookUser.getEmail().isEmpty()) {
            logger.warn("Facebook did not provide email. The 'email' permission may be missing.");
            throw new IllegalArgumentException("Không lấy được email từ Facebook. Vui lòng cấp quyền email khi đăng nhập.");
        }

        NguoiDung nguoiDung = processUserAfterFacebookLogin(facebookUser.getEmail(), facebookUser.getName());

        UserDetailsImpl userDetails = UserDetailsImpl.build(nguoiDung);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtUtils.generateJwtToken(authentication);

        // Get actual role name from database instead of Spring Security authorities
        List<String> roles = new ArrayList<>();
        if (nguoiDung.getVaiTro() != null) {
            roles.add(nguoiDung.getVaiTro().getTenVaiTro());
        }

        String birthDate = (nguoiDung.getNgaySinh() != null) ? nguoiDung.getNgaySinh().toString() : null;

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                nguoiDung.getHoTen(),
                nguoiDung.getSoDienThoai(),
                roles,
                nguoiDung.getDiaChi(),
                birthDate);
    }

    private String generateAppSecretProof(String accessToken) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec keySpec = new javax.crypto.spec.SecretKeySpec(facebookAppSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] result = mac.doFinal(accessToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(result.length * 2);
            for (byte b : result) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            logger.error("Failed to generate appsecret_proof", e);
            throw new RuntimeException("Internal error generating appsecret_proof");
        }
    }

    private NguoiDung processUserAfterFacebookLogin(String email, String name) {
        Optional<NguoiDung> userOptional = nguoiDungRepository.findByEmail(email);
        if (userOptional.isPresent()) {
            NguoiDung existingUser = userOptional.get();
            if (!existingUser.isDangHoatDong()) {
                throw new RuntimeException("User is blocked");
            }
            return existingUser;
        } else {
            NguoiDung newUser = new NguoiDung();
            newUser.setEmail(email);
            newUser.setTenDangNhap(email); // Use email as username
            newUser.setHoTen(name);
            // Generate a random secure password as it won't be used for login
            newUser.setMatKhauBam(passwordEncoder.encode(UUID.randomUUID().toString()));

            VaiTro userRole = vaiTroRepository.findByTenVaiTro("KhachHang") // Default customer role
                    .orElseThrow(() -> new RuntimeException("Error: Default role ROLE_CUSTOMER was not found."));
            newUser.setVaiTro(userRole);

            newUser.setDangHoatDong(true);
            newUser.setNgayTao(OffsetDateTime.now());

            NguoiDung savedUser = nguoiDungRepository.save(newUser);
            
            // Auto-sync to khach_hang table
            try {
                khachHangService.syncCustomerFromNguoiDung(savedUser.getMaNguoiDung());
            } catch (Exception e) {
                logger.error("Failed to sync Facebook user to khach_hang table", e);
            }
            
            return savedUser;
        }
    }
}
