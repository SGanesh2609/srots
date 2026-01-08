package com.srots.service;

import java.util.*;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.BranchDTO;
import com.srots.dto.CollegeRequest;
import com.srots.dto.CollegeResponse;
import com.srots.model.College;
import com.srots.model.Job;
import com.srots.model.User;
import com.srots.repository.CollegeRepository;
import com.srots.repository.JobRepository;
import com.srots.repository.UserRepository;
import com.srots.service.CollegeService;
import com.srots.service.FileService;

@Service
public class CollegeServiceImpl implements CollegeService {

    @Autowired private CollegeRepository collegeRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private JobRepository jobRepo; 
    @Autowired private ObjectMapper mapper;
    @Autowired private FileService fileService; // Injected FileService

    @Override
    @Transactional
    public CollegeResponse createCollege(CollegeRequest dto) {
        if(collegeRepo.existsByCode(dto.getCode())) {
            throw new RuntimeException("College code '" + dto.getCode() + "' already exists.");
        }
        College college = new College();
        mapDtoToEntity(college, dto);
        return convertToResponse(collegeRepo.save(college));
    }

    @Override
    @Transactional
    public CollegeResponse updateCollege(String id, CollegeRequest dto) {
        College college = collegeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("College not found with ID: " + id));

        // 1. Logo Cleanup using FileService
        if (dto.getLogoUrl() != null && !dto.getLogoUrl().equals(college.getLogoUrl())) {
            fileService.deleteFile(college.getLogoUrl());
        }

        // 2. About Section Image Cleanup
        handleAboutSectionFileCleanup(college, dto);

        mapDtoToEntity(college, dto);
        return convertToResponse(collegeRepo.save(college));
    }
    
    @Override
    @Transactional
    public void deleteCollege(String id) {
        College college = collegeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("College not found with ID: " + id));

        // 1. Delete the Logo file via FileService
        if (college.getLogoUrl() != null) {
            fileService.deleteFile(college.getLogoUrl());
        }

        // 2. Delete all images from the About Sections
        try {
            if (college.getAboutSections() != null) {
                List<Map<String, Object>> sections = mapper.readValue(college.getAboutSections(), 
                        new TypeReference<List<Map<String, Object>>>() {});
                
                for (Map<String, Object> section : sections) {
                    String imageUrl = (String) section.get("imageUrl");
                    if (imageUrl != null) {
                        fileService.deleteFile(imageUrl);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error cleaning up about section files: " + e.getMessage());
        }

        collegeRepo.delete(college);
    }

    @Override
    public String uploadFile(MultipartFile file, String collegeCode, String category) {
        // Delegate to FileService
        return fileService.uploadFile(file, collegeCode, category);
    }

    private void handleAboutSectionFileCleanup(College entity, CollegeRequest dto) {
        try {
            if (dto.getAboutSections() == null || entity.getAboutSections() == null) return;

            List<Map<String, Object>> newSections = mapper.convertValue(dto.getAboutSections(), new TypeReference<>() {});
            List<String> newUrls = newSections.stream()
                    .map(s -> (String) s.get("imageUrl")).filter(Objects::nonNull).toList();

            List<Map<String, Object>> oldSections = mapper.readValue(entity.getAboutSections(), new TypeReference<>() {});
            for (Map<String, Object> section : oldSections) {
                String oldUrl = (String) section.get("imageUrl");
                // If old URL is not in the new list, it was removed by user, so delete from storage
                if (oldUrl != null && !newUrls.contains(oldUrl)) {
                    fileService.deleteFile(oldUrl);
                }
            }
        } catch (Exception e) { 
            System.err.println("About Section Cleanup Error: " + e.getMessage()); 
        }
    }

    // Helper mappers and getters
    private void mapDtoToEntity(College c, CollegeRequest d) {
        c.setName(d.getName());
        c.setCode(d.getCode());
        c.setType(d.getType());
        c.setEmail(d.getEmail());
        c.setPhone(d.getPhone());
        c.setLandline(d.getLandline());
        c.setLogoUrl(d.getLogoUrl());
        try {
            c.setAddressJson(mapper.writeValueAsString(d.getAddress()));
            c.setSocialMedia(mapper.writeValueAsString(d.getSocialMedia()));
            c.setAboutSections(mapper.writeValueAsString(d.getAboutSections()));
        } catch (Exception e) { }
    }

    private CollegeResponse convertToResponse(College entity) {
        CollegeResponse res = new CollegeResponse();
        BeanUtils.copyProperties(entity, res);
        try {
            if (entity.getAddressJson() != null) {
                Map<String, Object> addr = mapper.readValue(entity.getAddressJson(), Map.class);
                res.setAddress_json(addr);
                res.setAddress(addr.get("city") + ", " + addr.get("state"));
            }
            res.setSocialMedia(entity.getSocialMedia() != null ? mapper.readValue(entity.getSocialMedia(), Map.class) : null);
            res.setAboutSections(entity.getAboutSections() != null ? mapper.readValue(entity.getAboutSections(), List.class) : null);
            res.setBranches(entity.getBranches() != null ? mapper.readValue(entity.getBranches(), List.class) : null);
        } catch (Exception e) { }
        
        res.setStudentCount(userRepo.countByCollegeIdAndRole(entity.getId(), User.Role.STUDENT));
        res.setCphCount(userRepo.countByCollegeIdAndRole(entity.getId(), User.Role.CPH));
        res.setActiveJobs(jobRepo.countByCollegeIdAndStatus(entity.getId(), Job.JobStatus.Active));
        return res;
    }

    @Override public List<CollegeResponse> getColleges(String q) { return collegeRepo.searchColleges(q).stream().map(this::convertToResponse).toList(); }
    @Override public CollegeResponse getCollegeById(String id) { return convertToResponse(collegeRepo.findById(id).orElseThrow(() -> new RuntimeException("College not found with ID: " + id))); }
    @Override public List<Object> getBranchesByCollegeId(String id) { College c = collegeRepo.findById(id).orElseThrow(() -> new RuntimeException("College not found")); return parseJsonList(c.getBranches()); }
    @Override public Object getSocialMediaByCollegeId(String id) { College c = collegeRepo.findById(id).orElseThrow(() -> new RuntimeException("College not found")); try { return mapper.readValue(c.getSocialMedia(), Map.class); } catch (Exception e) { return null; } }
    @Override public List<Object> getAboutSectionsByCollegeId(String id) { College c = collegeRepo.findById(id).orElseThrow(() -> new RuntimeException("College not found")); return parseJsonList(c.getAboutSections()); }
    
    private List<Object> parseJsonList(String json) {
        try { return json != null ? mapper.readValue(json, new TypeReference<List<Object>>(){}) : new ArrayList<>(); } 
        catch (Exception e) { return new ArrayList<>(); }
    }

    @Override
    @Transactional
    public CollegeResponse addBranch(String id, BranchDTO branch) {
        College college = collegeRepo.findById(id).orElseThrow(() -> new RuntimeException("College not found"));
        try {
            List<BranchDTO> list = college.getBranches() == null ? new ArrayList<>() : mapper.readValue(college.getBranches(), new TypeReference<List<BranchDTO>>(){});
            list.add(branch);
            college.setBranches(mapper.writeValueAsString(list));
        } catch (Exception e) { throw new RuntimeException("Error processing branch data"); }
        return convertToResponse(collegeRepo.save(college));
    }
}