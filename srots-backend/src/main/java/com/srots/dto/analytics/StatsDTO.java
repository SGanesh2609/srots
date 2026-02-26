package com.srots.dto.analytics;

public class StatsDTO {

    private Long totalStudents;
    private Long placedStudents;
    private Double placementRate;
    private Long companiesVisited;

    public StatsDTO() {}

    public StatsDTO(Long totalStudents, Long placedStudents, Double placementRate, Long companiesVisited) {
        this.totalStudents    = totalStudents;
        this.placedStudents   = placedStudents;
        this.placementRate    = placementRate;
        this.companiesVisited = companiesVisited;
    }

    public Long getTotalStudents()    { return totalStudents; }
    public Long getPlacedStudents()   { return placedStudents; }
    public Double getPlacementRate()  { return placementRate; }
    public Long getCompaniesVisited() { return companiesVisited; }

    public void setTotalStudents(Long v)    { this.totalStudents    = v; }
    public void setPlacedStudents(Long v)   { this.placedStudents   = v; }
    public void setPlacementRate(Double v)  { this.placementRate    = v; }
    public void setCompaniesVisited(Long v) { this.companiesVisited = v; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long   totalStudents;
        private Long   placedStudents;
        private Double placementRate;
        private Long   companiesVisited;

        public Builder totalStudents(Long v)    { this.totalStudents    = v; return this; }
        public Builder placedStudents(Long v)   { this.placedStudents   = v; return this; }
        public Builder placementRate(Double v)  { this.placementRate    = v; return this; }
        public Builder companiesVisited(Long v) { this.companiesVisited = v; return this; }

        public StatsDTO build() {
            return new StatsDTO(totalStudents, placedStudents, placementRate, companiesVisited);
        }
    }
}