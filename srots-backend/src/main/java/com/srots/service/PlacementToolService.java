package com.srots.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

public interface PlacementToolService {
	Map<String, Object> compareFiles(MultipartFile master, MultipartFile resultFile, String compareField) throws Exception;
    
	List<String> getFileHeaders(MultipartFile file) throws Exception;
	Map<String, Object> cleanData(MultipartFile file, String excludeCols, String excludeIds) throws Exception;
    
    Map<String, Object> gatherData(Map<String, Object> request, String collegeId);
    Map<String, List<String>> getAvailableFields();
    
    byte[] exportData(List<List<String>> data, String format) throws Exception;
}