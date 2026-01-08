package com.srots.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.BranchDTO;
import com.srots.dto.CollegeRequest;
import com.srots.dto.CollegeResponse;
import com.srots.dto.UploadResponse;
import com.srots.model.College;

public interface CollegeService {
	
	public List<CollegeResponse> getColleges(String query);
    public CollegeResponse createCollege(CollegeRequest dto);
    public String uploadFile(MultipartFile file, String collegeCode, String category);
    public CollegeResponse updateCollege(String id, CollegeRequest dto);
    public CollegeResponse addBranch(String collegeId, BranchDTO branchDto);
    public CollegeResponse getCollegeById(String id);
    public List<Object> getBranchesByCollegeId(String id);
    public Object getSocialMediaByCollegeId(String id);
    public List<Object> getAboutSectionsByCollegeId(String id);
    public void deleteCollege(String id);
}
