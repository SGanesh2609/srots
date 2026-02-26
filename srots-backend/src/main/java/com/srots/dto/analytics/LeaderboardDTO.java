package com.srots.dto.analytics;

public class LeaderboardDTO {

    private String name;
    private String placement;   // e.g. "85%"
    private Long   jobs;

    public LeaderboardDTO() {}

    public LeaderboardDTO(String name, String placement, Long jobs) {
        this.name      = name;
        this.placement = placement;
        this.jobs      = jobs;
    }

    public String getName()      { return name; }
    public String getPlacement() { return placement; }
    public Long   getJobs()      { return jobs; }

    public void setName(String v)      { this.name      = v; }
    public void setPlacement(String v) { this.placement = v; }
    public void setJobs(Long v)        { this.jobs      = v; }
}