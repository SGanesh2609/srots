package com.srots.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.collegedto.AboutSectionDTO;
import com.srots.dto.collegedto.BranchDTO;
import com.srots.dto.collegedto.CollegeRequest;
import com.srots.dto.collegedto.CollegeResponse;
import com.srots.dto.collegedto.CollegeStatsDTO;
import com.srots.dto.collegedto.SocialMediaDTO;
import com.srots.model.College;
import com.srots.model.Job;
import com.srots.model.User;
import com.srots.repository.CollegeRepository;
import com.srots.repository.JobRepository;
import com.srots.repository.UserRepository;

@Service
public class CollegeServiceImpl implements CollegeService {

    private static final Logger logger = LoggerFactory.getLogger(CollegeServiceImpl.class);

    @Autowired private CollegeRepository collegeRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private JobRepository jobRepo;
    @Autowired private ObjectMapper mapper;
    @Autowired private FileService fileService;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$", Pattern.CASE_INSENSITIVE);
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\d{10}$");
    private static final Pattern CODE_PATTERN = Pattern.compile("^[A-Z0-9]+$");

    @Override
    @Transactional
    public CollegeResponse createCollege(CollegeRequest dto) {
        validateRequest(dto, null); // null for create
        if (collegeRepo.existsByCode(dto.getCode())) {
            throw new BadRequestException("College code '" + dto.getCode() + "' already exists.");
        }
        College college = new College();
        mapDtoToEntity(college, dto);
        college.setActive(true);
        logger.info("Creating college: {}", college.getCode());
        return convertToResponse(collegeRepo.save(college));
    }

    @Override
    @Transactional
    public CollegeResponse updateCollege(String id, CollegeRequest dto) {
        College college = collegeRepo.findById(id)
                .orElseThrow(() -> new BadRequestException("College not found with ID: " + id));
        validateRequest(dto, id); // id for update
        handleAboutSectionFileCleanup(college, dto);
        if (dto.getLogoUrl() != null && !dto.getLogoUrl().equals(college.getLogoUrl())) {
            fileService.deleteFile(college.getLogoUrl());
        }
        mapDtoToEntity(college, dto);
        logger.info("Updating college: {}", id);
        return convertToResponse(collegeRepo.save(college));
    }

    @Override
    @Transactional
    public void softDelete(String id) {
        College college = collegeRepo.findById(id)
                .orElseThrow(() -> new BadRequestException("College not found with ID: " + id));
        college.setActive(false);
        college.setUpdatedAt(LocalDateTime.now());
        collegeRepo.save(college);
        logger.info("Soft deleted college: {}", id);
        // Note: No file cleanup for soft delete
    }

    @Override
    @Transactional
    public void permanentDelete(String id) {
        College college = collegeRepo.findById(id)
                .orElseThrow(() -> new BadRequestException("College not found with ID: " + id));
        // File cleanup (logo, about images)
        if (college.getLogoUrl() != null) {
            fileService.deleteFile(college.getLogoUrl());
        }
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
            logger.error("Error cleaning up about section files for college {}: {}", id, e.getMessage());
        }
        collegeRepo.delete(college);
        logger.info("Permanently deleted college: {}", id);
    }

    @Override
    @Transactional
    public void activate(String id) {
        College college = collegeRepo.findById(id)
                .orElseThrow(() -> new BadRequestException("College not found with ID: " + id));
        college.setActive(true);
        college.setUpdatedAt(LocalDateTime.now());
        collegeRepo.save(college);
        logger.info("Activated college: {}", id);
    }

    @Override
    @Transactional
    public void deactivate(String id) {
        College college = collegeRepo.findById(id)
                .orElseThrow(() -> new BadRequestException("College not found with ID: " + id));
        college.setActive(false);
        college.setUpdatedAt(LocalDateTime.now());
        collegeRepo.save(college);
        logger.info("Deactivated college: {}", id);
    }

    private void validateRequest(CollegeRequest dto, String id) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BadRequestException("College name is required.");
        }
        if (dto.getCode() == null || !CODE_PATTERN.matcher(dto.getCode()).matches()) {
            throw new BadRequestException("College code must be alphanumeric uppercase.");
        }
        if (dto.getEmail() == null || !EMAIL_PATTERN.matcher(dto.getEmail()).matches()) {
            throw new BadRequestException("Invalid email format.");
        }
        if (dto.getPhone() == null || !PHONE_PATTERN.matcher(dto.getPhone()).matches()) {
            throw new BadRequestException("Phone must be 10 digits.");
        }
        if (dto.getLandline() != null && !PHONE_PATTERN.matcher(dto.getLandline()).matches()) {
            throw new BadRequestException("Landline must be 10 digits if provided.");
        }
        // Duplicate checks
        if (collegeRepo.existsByEmail(dto.getEmail()) && (id == null || !collegeRepo.findById(id).get().getEmail().equals(dto.getEmail()))) {
            throw new BadRequestException("Email already exists.");
        }
        if (collegeRepo.existsByPhone(dto.getPhone()) && (id == null || !collegeRepo.findById(id).get().getPhone().equals(dto.getPhone()))) {
            throw new BadRequestException("Phone already exists.");
        }
        if (dto.getLandline() != null && collegeRepo.existsByLandline(dto.getLandline()) && (id == null || !collegeRepo.findById(id).get().getLandline().equals(dto.getLandline()))) {
            throw new BadRequestException("Landline already exists.");
        }
        if (id != null && collegeRepo.existsByCodeAndIdNot(dto.getCode(), id)) {
            throw new BadRequestException("College code already exists.");
        }
    }

    @Override
    public Page<CollegeResponse> getColleges(String query, boolean includeInactive, Pageable pageable) {
        Page<College> colleges = collegeRepo.searchColleges(query, includeInactive, pageable);
        return colleges.map(this::convertToResponse);
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
            if (entity.getAboutSections() != null) {
                List<Object> sections = mapper.readValue(entity.getAboutSections(), new TypeReference<>() {});
                res.setAboutSections(sections);
            }
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

    // NEW THINGS

    @Override
    @Transactional
    public String updateCollegeLogo(String id, MultipartFile file) {
        College college = collegeRepo.findById(id).orElseThrow();
        String oldLogo = college.getLogoUrl();
        String newUrl = fileService.uploadFile(file, college.getCode(), "logo");
        college.setLogoUrl(newUrl);
        college.setUpdatedAt(LocalDateTime.now());
        collegeRepo.save(college);
        if (oldLogo != null) fileService.deleteFile(oldLogo);
        return newUrl;
    }

    @Override
    @Transactional
    public SocialMediaDTO updateSocialMedia(String id, SocialMediaDTO dto) {
        College college = collegeRepo.findById(id).orElseThrow();
        try {
            college.setSocialMedia(mapper.writeValueAsString(dto));
            college.setUpdatedAt(LocalDateTime.now());
            collegeRepo.save(college);
            return dto; // Or reload parsed
        } catch (Exception e) {
            throw new RuntimeException("Social update failed");
        }
    }

    @Override
    @Transactional
    public AboutSectionDTO addAboutSection(String id, AboutSectionDTO dto) {
        College college = collegeRepo.findById(id).orElseThrow();
        List<AboutSectionDTO> sections = parseAboutSections(college.getAboutSections());
        dto.setId(UUID.randomUUID().toString());
        dto.setLastModifiedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        dto.setLastModifiedAt(LocalDateTime.now());
        sections.add(dto);
        try {
            college.setAboutSections(mapper.writeValueAsString(sections));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        college.setUpdatedAt(LocalDateTime.now());
        collegeRepo.save(college);
        return dto;
    }

    @Override
    @Transactional
    public AboutSectionDTO updateAboutSection(String id, String sectionId, AboutSectionDTO dto) {
        College college = collegeRepo.findById(id).orElseThrow();
        List<AboutSectionDTO> sections = parseAboutSections(college.getAboutSections());
        AboutSectionDTO existing = sections.stream().filter(s -> s.getId().equals(sectionId)).findFirst().orElseThrow();
        String oldImage = existing.getImage();
        dto.setId(sectionId);
        dto.setLastModifiedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        dto.setLastModifiedAt(LocalDateTime.now());
        // Replace in list
        int idx = sections.indexOf(existing);
        sections.set(idx, dto);
        try {
            college.setAboutSections(mapper.writeValueAsString(sections));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        college.setUpdatedAt(LocalDateTime.now());
        collegeRepo.save(college);
        if (oldImage != null && !oldImage.equals(dto.getImage())) fileService.deleteFile(oldImage);
        return dto;
    }

    @Override
    @Transactional
    public void deleteAboutSection(String id, String sectionId) {
        College college = collegeRepo.findById(id).orElseThrow();
        List<AboutSectionDTO> sections = parseAboutSections(college.getAboutSections());
        AboutSectionDTO toDelete = sections.stream().filter(s -> s.getId().equals(sectionId)).findFirst().orElseThrow();
        if (toDelete.getImage() != null) fileService.deleteFile(toDelete.getImage());
        sections.removeIf(s -> s.getId().equals(sectionId));
        try {
            college.setAboutSections(mapper.writeValueAsString(sections));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        college.setUpdatedAt(LocalDateTime.now());
        collegeRepo.save(college);
    }

    private List<AboutSectionDTO> parseAboutSections(String json) {
        try {
            return json != null ? mapper.readValue(json, new TypeReference<>() {}) : new ArrayList<>();
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }


    @Override
    @Transactional
    public CollegeResponse addBranch(String id, BranchDTO branch) {
        College college = collegeRepo.findById(id).orElseThrow();
        try {
            List<BranchDTO> list = parseBranches(college.getBranches());
            // Prevent duplicates
            list.removeIf(b -> b.code.equalsIgnoreCase(branch.code));
            list.add(branch);
            college.setBranches(mapper.writeValueAsString(list));
            return convertToResponse(collegeRepo.save(college));
        } catch (Exception e) { throw new RuntimeException("Add branch failed"); }
    }

    @Override
    @Transactional
    public CollegeResponse updateBranch(String id, String branchCode, BranchDTO branch) {
        College college = collegeRepo.findById(id).orElseThrow();
        try {
            List<BranchDTO> list = parseBranches(college.getBranches());
            for (int i = 0; i < list.size(); i++) {
                if (list.get(i).code.equalsIgnoreCase(branchCode)) {
                    list.set(i, branch);
                    break;
                }
            }
            college.setBranches(mapper.writeValueAsString(list));
            return convertToResponse(collegeRepo.save(college));
        } catch (Exception e) { throw new RuntimeException("Update branch failed"); }
    }

    @Override
    @Transactional
    public CollegeResponse deleteBranch(String id, String branchCode) {
        College college = collegeRepo.findById(id).orElseThrow();
        try {
            List<BranchDTO> list = parseBranches(college.getBranches());
            list.removeIf(b -> b.code.equalsIgnoreCase(branchCode));
            college.setBranches(mapper.writeValueAsString(list));
            return convertToResponse(collegeRepo.save(college));
        } catch (Exception e) { throw new RuntimeException("Delete branch failed"); }
    }

    private List<BranchDTO> parseBranches(String json) {
        try {
            return json != null ? mapper.readValue(json, new TypeReference<List<BranchDTO>>(){}) : new ArrayList<>();
        } catch (Exception e) { return new ArrayList<>(); }
    }

    // Custom exception for better handling
    public static class BadRequestException extends RuntimeException {
        public BadRequestException(String message) {
            super(message);
        }
    }
    
    @Override
    public CollegeStatsDTO getCollegeStats(String collegeId) {
        // Verify the college exists first — throws if not found
        collegeRepo.findById(collegeId)
                .orElseThrow(() -> new BadRequestException("College not found with ID: " + collegeId));

        long studentCount = userRepo.countByCollegeIdAndRole(collegeId, User.Role.STUDENT);
        long cpCount      = userRepo.countByCollegeIdAndRole(collegeId, User.Role.CPH);
        long totalJobs    = jobRepo.countByCollegeId(collegeId);
        long activeJobs   = jobRepo.countByCollegeIdAndStatus(collegeId, Job.JobStatus.Active);

        logger.info("Stats for college {}: students={}, cp={}, totalJobs={}, activeJobs={}",
                collegeId, studentCount, cpCount, totalJobs, activeJobs);

        return new CollegeStatsDTO(studentCount, cpCount, totalJobs, activeJobs);
    }
}