package com.taskmanager.service;

import com.taskmanager.exception.BadRequestException;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.model.*;
import com.taskmanager.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final TestRepository testRepository;
    private final TestQuestionRepository questionRepository;
    private final TestOptionRepository optionRepository;
    private final TestSubmissionRepository submissionRepository;
    private final TestResponseRepository responseRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    public SkillService(SkillRepository skillRepository, TestRepository testRepository,
                        TestQuestionRepository questionRepository, TestOptionRepository optionRepository,
                        TestSubmissionRepository submissionRepository, TestResponseRepository responseRepository,
                        UserService userService, UserRepository userRepository) {
        this.skillRepository = skillRepository;
        this.testRepository = testRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.submissionRepository = submissionRepository;
        this.responseRepository = responseRepository;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // ---- Skills ----
    public List<Skill> getAllSkills() { return skillRepository.findAll(); }

    @Transactional
    public Skill createSkill(String name, String description, String icon, String color) {
        if (skillRepository.existsByNameIgnoreCase(name))
            throw new BadRequestException("Skill '" + name + "' already exists");
        User creator = userService.getCurrentUser();
        return skillRepository.save(Skill.builder().name(name).description(description)
                .icon(icon).color(color).createdBy(creator).build());
    }

    @Transactional
    public void deleteSkill(Long id) {
        skillRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Skill", id));
        skillRepository.deleteById(id);
    }

    // ---- Tests ----
    public List<Test> getAllTests() { return testRepository.findByActiveTrue(); }

    public Test getTest(Long id) {
        return testRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Test", id));
    }

    @Transactional
    public Test createTest(Map<String, Object> payload) {
        User creator = userService.getCurrentUser();
        Long skillId = Long.valueOf(payload.get("skillId").toString());
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", skillId));

        Test test = Test.builder()
                .title(payload.get("title").toString())
                .description(payload.getOrDefault("description", "").toString())
                .skill(skill).createdBy(creator)
                .timeLimitMinutes(payload.containsKey("timeLimitMinutes")
                        ? Integer.valueOf(payload.get("timeLimitMinutes").toString()) : 30)
                .build();
        test = testRepository.save(test);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> questions = (List<Map<String, Object>>) payload.get("questions");
        if (questions != null) {
            int idx = 0;
            for (Map<String, Object> q : questions) {
                TestQuestion question = new TestQuestion();
                question.setTest(test);
                question.setQuestionText(q.get("questionText").toString());
                question.setPoints(q.containsKey("points") ? Integer.valueOf(q.get("points").toString()) : 1);
                question.setOrderIndex(idx++);
                question.setQuestionType(TestQuestion.QuestionType.MCQ);
                question = questionRepository.save(question);

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> options = (List<Map<String, Object>>) q.get("options");
                if (options != null) {
                    for (Map<String, Object> o : options) {
                        TestOption opt = new TestOption();
                        opt.setQuestion(question);
                        opt.setOptionText(o.get("optionText").toString());
                        opt.setCorrect(Boolean.parseBoolean(o.getOrDefault("correct", false).toString()));
                        optionRepository.save(opt);
                    }
                }
            }
        }
        return testRepository.findById(test.getId()).orElseThrow();
    }

    // ---- Submissions ----
    @Transactional
    public TestSubmission startTest(Long testId) {
        User user = userService.getCurrentUser();
        Test test = getTest(testId);
        if (submissionRepository.findByTestAndUserAndStatus(test, user, TestSubmission.Status.IN_PROGRESS).isPresent())
            throw new BadRequestException("You already have an in-progress attempt for this test");

        TestSubmission sub = new TestSubmission();
        sub.setTest(test);
        sub.setUser(user);
        sub.setStartedAt(LocalDateTime.now());
        sub.setStatus(TestSubmission.Status.IN_PROGRESS);
        int maxScore = test.getQuestions() != null
                ? test.getQuestions().stream().mapToInt(q -> q.getPoints() != null ? q.getPoints() : 1).sum() : 0;
        sub.setMaxScore(maxScore);
        return submissionRepository.save(sub);
    }

    @Transactional
    public TestSubmission submitTest(Long submissionId, Map<Long, Long> answers) {
        User user = userService.getCurrentUser();
        TestSubmission sub = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", submissionId));
        if (!sub.getUser().getId().equals(user.getId()))
            throw new BadRequestException("Not your submission");

        int totalScore = 0;
        for (Map.Entry<Long, Long> entry : answers.entrySet()) {
            TestQuestion question = questionRepository.findById(entry.getKey()).orElse(null);
            if (question == null) continue;

            TestResponse response = new TestResponse();
            response.setSubmission(sub);
            response.setQuestion(question);

            if (entry.getValue() != null) {
                TestOption selectedOpt = null;
                if (question.getOptions() != null) {
                    selectedOpt = question.getOptions().stream()
                            .filter(o -> o.getId().equals(entry.getValue())).findFirst().orElse(null);
                }
                if (selectedOpt != null) {
                    response.setSelectedOption(selectedOpt);
                    response.setCorrect(selectedOpt.isCorrect());
                    if (selectedOpt.isCorrect()) {
                        int pts = question.getPoints() != null ? question.getPoints() : 1;
                        response.setPointsEarned(pts);
                        totalScore += pts;
                    }
                }
            }
            responseRepository.save(response);
        }

        sub.setScore(totalScore);
        sub.setCompletedAt(LocalDateTime.now());
        sub.setStatus(TestSubmission.Status.COMPLETED);
        return submissionRepository.save(sub);
    }

    // ---- Leaderboard ----
    public List<Map<String, Object>> getLeaderboard() {
        List<User> members = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.MEMBER).collect(Collectors.toList());

        List<Map<String, Object>> board = new ArrayList<>();
        for (User member : members) {
            Integer totalScore = submissionRepository.getTotalScoreForUser(member);
            long completed = submissionRepository.countCompletedByUser(member);
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("userId", member.getId());
            entry.put("name", member.getName());
            entry.put("email", member.getEmail());
            entry.put("totalScore", totalScore != null ? totalScore : 0);
            entry.put("testsCompleted", completed);
            board.add(entry);
        }
        board.sort((a, b) -> Integer.compare(
                (int) b.get("totalScore"), (int) a.get("totalScore")));
        for (int i = 0; i < board.size(); i++) board.get(i).put("rank", i + 1);
        return board;
    }

    public List<TestSubmission> getUserSubmissions() {
        User user = userService.getCurrentUser();
        return submissionRepository.findByUserAndStatus(user, TestSubmission.Status.COMPLETED);
    }
}
