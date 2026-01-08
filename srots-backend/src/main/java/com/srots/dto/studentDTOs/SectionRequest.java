package com.srots.dto.studentDTOs;

import lombok.Data;

@Data
public class SectionRequest<T> {
    private T data;
    private boolean isDelete;
	public SectionRequest() {
		super();
		// TODO Auto-generated constructor stub
	}
	public SectionRequest(T data, boolean isDelete) {
		super();
		this.data = data;
		this.isDelete = isDelete;
	}
	public T getData() {
		return data;
	}
	public void setData(T data) {
		this.data = data;
	}
	public boolean isDelete() {
		return isDelete;
	}
	public void setDelete(boolean isDelete) {
		this.isDelete = isDelete;
	}
    
    
    
}
