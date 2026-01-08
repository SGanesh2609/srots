package com.srots.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "students")
public class Student {
    @Id
    private String id;

    private String name;
    private String email;

    @Column(name = "college_id")
    private String collegeId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
