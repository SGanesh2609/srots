package com.srots.dto.analytics;

public class BranchDistributionDTO {

    private String name;
    private Long   count;

    public BranchDistributionDTO() {}

    public BranchDistributionDTO(String name, Long count) {
        this.name  = name;
        this.count = count;
    }

    public String getName()  { return name; }
    public Long   getCount() { return count; }

    public void setName(String v)  { this.name  = v; }
    public void setCount(Long v)   { this.count = v; }
}