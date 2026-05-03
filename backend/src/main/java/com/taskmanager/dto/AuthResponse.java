package com.taskmanager.dto;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String name;
    private String email;
    private String role;

    public AuthResponse() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String token;
        private Long id;
        private String name;
        private String email;
        private String role;

        public Builder token(String token) { this.token = token; return this; }
        public Builder type(String type) { return this; }
        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder role(String role) { this.role = role; return this; }

        public AuthResponse build() {
            AuthResponse r = new AuthResponse();
            r.token = this.token;
            r.id = this.id;
            r.name = this.name;
            r.email = this.email;
            r.role = this.role;
            return r;
        }
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getType() { return type; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
