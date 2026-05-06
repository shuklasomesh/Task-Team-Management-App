package com.taskmanager.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DebugController {

    @Value("${cors.origins:NOT_FOUND}")
    private String corsOrigins;

    @GetMapping("/debug/cors")
    public String debugCors() {
        return "CORS origins loaded as: [" + corsOrigins + "]";
    }
}
