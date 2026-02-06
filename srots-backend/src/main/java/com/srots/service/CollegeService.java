package com.srots.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.srots.dto.collegedto.AboutSectionDTO;
import com.srots.dto.collegedto.BranchDTO;
import com.srots.dto.collegedto.CollegeRequest;
import com.srots.dto.collegedto.CollegeResponse;
import com.srots.dto.collegedto.SocialMediaDTO;

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
    
 // New partial methods
    String updateCollegeLogo(String id, MultipartFile file);
    SocialMediaDTO updateSocialMedia(String id, SocialMediaDTO dto);
    AboutSectionDTO addAboutSection(String id, AboutSectionDTO dto);
    AboutSectionDTO updateAboutSection(String id, String sectionId, AboutSectionDTO dto);
    void deleteAboutSection(String id, String sectionId);
}
