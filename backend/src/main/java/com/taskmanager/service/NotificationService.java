package com.taskmanager.service;

import com.taskmanager.model.Notification;
import com.taskmanager.model.Task;
import com.taskmanager.model.User;
import com.taskmanager.repository.NotificationRepository;
import com.taskmanager.repository.TaskRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final TaskRepository taskRepository;

    public NotificationService(NotificationRepository notificationRepository, TaskRepository taskRepository) {
        this.notificationRepository = notificationRepository;
        this.taskRepository = taskRepository;
    }

    public void notifyTaskAssigned(User recipient, Task task) {
        if (notificationRepository.existsByRecipientAndTypeAndRelatedEntityId(recipient, "TASK_ASSIGNED", task.getId())) {
            return;
        }
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setType("TASK_ASSIGNED");
        n.setMessage("You were assigned to: " + task.getTitle());
        n.setRelatedEntityId(task.getId());
        notificationRepository.save(n);
    }

    public void notifyTaskComment(User recipient, Task task, User commenter) {
        if (recipient.getId().equals(commenter.getId())) return;
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setType("TASK_COMMENT");
        n.setMessage(commenter.getName() + " commented on: " + task.getTitle());
        n.setRelatedEntityId(task.getId());
        notificationRepository.save(n);
    }

    public List<Notification> getNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user, PageRequest.of(0, 30));
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndReadFalse(user);
    }

    @Transactional
    public void markRead(Long id, User user) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getRecipient().getId().equals(user.getId())) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllRead(User user) {
        notificationRepository.markAllReadForRecipient(user);
    }

    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void checkDeadlines() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Task> dueSoon = taskRepository.findByDueDateAndStatusNot(tomorrow, Task.Status.DONE);
        for (Task task : dueSoon) {
            if (task.getAssignee() == null) continue;
            if (notificationRepository.existsByRecipientAndTypeAndRelatedEntityId(
                    task.getAssignee(), "DEADLINE_NEAR", task.getId())) continue;
            Notification n = new Notification();
            n.setRecipient(task.getAssignee());
            n.setType("DEADLINE_NEAR");
            n.setMessage("Task due tomorrow: " + task.getTitle());
            n.setRelatedEntityId(task.getId());
            notificationRepository.save(n);
        }
    }
}
