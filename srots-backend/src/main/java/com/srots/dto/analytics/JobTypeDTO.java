package com.srots.dto.analytics;

import com.srots.model.Job.JobType;

public class JobTypeDTO {

    private String name;
    private Long   count;

    public JobTypeDTO() {}

    public JobTypeDTO(String name, Long count) {
        this.name  = name;
        this.count = count;
    }

    /** Constructor used by JPQL: new JobTypeDTO(j.jobType, COUNT(j.id)) */
    public JobTypeDTO(JobType type, Long count) {
        this.name  = type != null ? type.getDisplay() : "Unknown";
        this.count = count;
    }

    public String getName()  { return name; }
    public Long   getCount() { return count; }

    public void setName(String v)  { this.name  = v; }
    public void setCount(Long v)   { this.count = v; }
}