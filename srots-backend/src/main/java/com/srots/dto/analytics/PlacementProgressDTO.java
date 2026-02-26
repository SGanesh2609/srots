package com.srots.dto.analytics;

public class PlacementProgressDTO {

    private Integer year;
    private Integer month;
    private String  label;   // e.g. "January"
    private Long    value;   // placed count

    public PlacementProgressDTO() {}

    public PlacementProgressDTO(Integer year, Integer month, String label, Long value) {
        this.year  = year;
        this.month = month;
        this.label = label;
        this.value = value;
    }

    public Integer getYear()  { return year; }
    public Integer getMonth() { return month; }
    public String  getLabel() { return label; }
    public Long    getValue() { return value; }

    public void setYear(Integer v)  { this.year  = v; }
    public void setMonth(Integer v) { this.month = v; }
    public void setLabel(String v)  { this.label = v; }
    public void setValue(Long v)    { this.value = v; }
}