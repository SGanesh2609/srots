package com.srots.dto.jobdto;

import com.srots.model.Job;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class JobDetailDTO {
    private Job job;
    private Long totalApplicants;
    private List<Map<String, Object>> roundsWithStats; // Includes 'qualifiedCount' per round

    public JobDetailDTO(Job job, Long totalApplicants, List<Map<String, Object>> roundsWithStats) {
        this.job = job;
        this.totalApplicants = totalApplicants;
        this.roundsWithStats = roundsWithStats;
    }
}