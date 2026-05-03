package com.taskmanager.repository;

import com.taskmanager.model.Skill;
import com.taskmanager.model.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestRepository extends JpaRepository<Test, Long> {
    List<Test> findByActiveTrue();
    List<Test> findBySkillAndActiveTrue(Skill skill);
}
