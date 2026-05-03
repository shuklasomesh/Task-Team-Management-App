package com.taskmanager.controller;

import com.taskmanager.model.*;
import com.taskmanager.service.SkillService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills().stream().map(this::toMap).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createSkill(@RequestBody Map<String, String> body) {
        Skill skill = skillService.createSkill(
                body.get("name"), body.getOrDefault("description", ""),
                body.getOrDefault("icon", "Code"), body.getOrDefault("color", "#6366f1"));
        return ResponseEntity.status(HttpStatus.CREATED).body(toMap(skill));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable Long id) {
        skillService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tests")
    public ResponseEntity<List<Map<String, Object>>> getAllTests() {
        return ResponseEntity.ok(skillService.getAllTests().stream().map(this::testToMap).collect(Collectors.toList()));
    }

    @GetMapping("/tests/{id}")
    public ResponseEntity<Map<String, Object>> getTest(@PathVariable Long id) {
        return ResponseEntity.ok(testToMap(skillService.getTest(id)));
    }

    @PostMapping("/tests")
    public ResponseEntity<Map<String, Object>> createTest(@RequestBody Map<String, Object> payload) {
        Test test = skillService.createTest(payload);
        return ResponseEntity.status(HttpStatus.CREATED).body(testToMap(test));
    }

    @PostMapping("/tests/{id}/start")
    public ResponseEntity<Map<String, Object>> startTest(@PathVariable Long id) {
        TestSubmission sub = skillService.startTest(id);
        return ResponseEntity.ok(submissionToMap(sub));
    }

    @PostMapping("/submissions/{id}/submit")
    public ResponseEntity<Map<String, Object>> submitTest(@PathVariable Long id,
                                                           @RequestBody Map<String, Long> answers) {
        Map<Long, Long> longMap = new HashMap<>();
        answers.forEach((k, v) -> longMap.put(Long.parseLong(k), v));
        TestSubmission sub = skillService.submitTest(id, longMap);
        return ResponseEntity.ok(submissionToMap(sub));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<Map<String, Object>>> getLeaderboard() {
        return ResponseEntity.ok(skillService.getLeaderboard());
    }

    @GetMapping("/my-submissions")
    public ResponseEntity<List<Map<String, Object>>> getMySubmissions() {
        return ResponseEntity.ok(skillService.getUserSubmissions().stream()
                .map(this::submissionToMap).collect(Collectors.toList()));
    }

    private Map<String, Object> toMap(Skill s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId()); m.put("name", s.getName());
        m.put("description", s.getDescription()); m.put("icon", s.getIcon());
        m.put("color", s.getColor()); m.put("createdAt", s.getCreatedAt());
        return m;
    }

    private Map<String, Object> testToMap(Test t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId()); m.put("title", t.getTitle());
        m.put("description", t.getDescription()); m.put("timeLimitMinutes", t.getTimeLimitMinutes());
        m.put("active", t.isActive()); m.put("createdAt", t.getCreatedAt());
        if (t.getSkill() != null) m.put("skill", toMap(t.getSkill()));
        if (t.getQuestions() != null) {
            m.put("questionCount", t.getQuestions().size());
            m.put("questions", t.getQuestions().stream().map(q -> {
                Map<String, Object> qm = new LinkedHashMap<>();
                qm.put("id", q.getId()); qm.put("questionText", q.getQuestionText());
                qm.put("points", q.getPoints()); qm.put("orderIndex", q.getOrderIndex());
                if (q.getOptions() != null) {
                    qm.put("options", q.getOptions().stream().map(o -> {
                        Map<String, Object> om = new LinkedHashMap<>();
                        om.put("id", o.getId()); om.put("optionText", o.getOptionText());
                        return om;
                    }).collect(Collectors.toList()));
                }
                return qm;
            }).collect(Collectors.toList()));
        }
        return m;
    }

    private Map<String, Object> submissionToMap(TestSubmission s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId()); m.put("score", s.getScore());
        m.put("maxScore", s.getMaxScore()); m.put("percentage", s.getPercentage());
        m.put("status", s.getStatus()); m.put("startedAt", s.getStartedAt());
        m.put("completedAt", s.getCompletedAt());
        if (s.getTest() != null) {
            Map<String, Object> tm = new LinkedHashMap<>();
            tm.put("id", s.getTest().getId()); tm.put("title", s.getTest().getTitle());
            m.put("test", tm);
        }
        return m;
    }
}
