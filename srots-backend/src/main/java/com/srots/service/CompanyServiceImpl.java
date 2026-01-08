package com.srots.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.CompanyRequest;
import com.srots.dto.CompanyResponse;
import com.srots.dto.SubscribeRequest;
import com.srots.exception.ResourceNotFoundException;
import com.srots.model.College;
import com.srots.model.CollegeCompanySubscription;
import com.srots.model.GlobalCompany;
import com.srots.model.SubscriptionId;
import com.srots.repository.CollegeCompanySubscriptionRepository;
import com.srots.repository.CollegeRepository;
import com.srots.repository.GlobalCompanyRepository;
import com.srots.repository.SubscriptionRepository;

@Service
public class CompanyServiceImpl implements CompanyService {

    @Autowired private GlobalCompanyRepository companyRepo;
    @Autowired private SubscriptionRepository subRepo;
    @Autowired private CollegeRepository collegeRepo;
    @Autowired private ObjectMapper mapper;
    @Autowired private CollegeCompanySubscriptionRepository subscriptionRepository;
    @Autowired private FileService fileService; // Added FileService

    public List<CompanyResponse> getCompanies(String query, String collegeId) {
        List<GlobalCompany> companies;
        if (collegeId != null && !collegeId.isEmpty()) {
            companies = subRepo.findByIdCollegeId(collegeId).stream()
                    .map(CollegeCompanySubscription::getCompany)
                    .collect(Collectors.toList());
        } else if (query != null && !query.isEmpty()) {
            companies = companyRepo.findByNameContainingIgnoreCase(query);
        } else {
            companies = companyRepo.findAll();
        }
        return companies.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(String id) {
        GlobalCompany company = companyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));
        return convertToResponse(company);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyByName(String name) {
        // Assuming your repository has findByNameIgnoreCase
        GlobalCompany company = companyRepo.findByNameIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with name: " + name));
        return convertToResponse(company);
    }

    @Transactional
    public CompanyResponse createCompany(CompanyRequest dto) {
        if (companyRepo.existsByNameIgnoreCase(dto.getName())) {
            throw new RuntimeException("Company '" + dto.getName() + "' already exists");
        }
        GlobalCompany company = new GlobalCompany();
        mapRequestToEntity(dto, company);
        return convertToResponse(companyRepo.save(company));
    }

    @Transactional
    public CompanyResponse updateCompany(String id, CompanyRequest dto) {
        GlobalCompany company = companyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));

        // --- LOGO CLEANUP LOGIC ---
        // If a new logo is uploaded, delete the old one from storage
        if (company.getLogoUrl() != null && dto.getLogoUrl() != null && 
            !company.getLogoUrl().equals(dto.getLogoUrl())) {
            fileService.deleteFile(company.getLogoUrl());
        }

        mapRequestToEntity(dto, company);
        return convertToResponse(companyRepo.save(company));
    }

    @Transactional
    public void deleteCompany(String id) {
        GlobalCompany company = companyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));
        
        // Delete physical logo file before deleting DB record
        if (company.getLogoUrl() != null) {
            fileService.deleteFile(company.getLogoUrl());
        }

        companyRepo.delete(company);
    }

    @Transactional
    public void subscribe(SubscribeRequest dto) {
        SubscriptionId subId = new SubscriptionId(dto.getCollegeId(), dto.getCompanyId());
        if (subRepo.existsById(subId)) return;

        College college = collegeRepo.findById(dto.getCollegeId())
                .orElseThrow(() -> new RuntimeException("College not found"));
        GlobalCompany company = companyRepo.findById(dto.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));
        
        subRepo.save(new CollegeCompanySubscription(subId, college, company, null));
    }
    
    @Override
    @Transactional
    public void unsubscribe(String collegeId, String companyId) {
        SubscriptionId id = new SubscriptionId(collegeId, companyId);
        if (subscriptionRepository.existsById(id)) {
            subscriptionRepository.deleteById(id);
        } else {
            throw new ResourceNotFoundException("Subscription not found");
        }
    }

 // --- Update these two private methods in your CompanyServiceImpl ---

    private void mapRequestToEntity(CompanyRequest dto, GlobalCompany entity) {
        entity.setName(dto.getName());
        entity.setWebsite(dto.getWebsite());
        entity.setDescription(dto.getDescription());
        
        // This now correctly receives the path from the DTO
        entity.setLogoUrl(dto.getLogoUrl());

        if (dto.getAddress() != null) {
            Map<String, String> addr = dto.getAddress();
            entity.setHeadquarters(addr.getOrDefault("city", "Unknown"));
            
            String fullAddr = Stream.of(addr.get("addressLine1"), addr.get("city"), addr.get("state"), addr.get("country"))
                .filter(s -> s != null && !s.isEmpty())
                .collect(Collectors.joining(", "));
            entity.setFullAddress(fullAddr);

            try {
                entity.setAddressJson(mapper.writeValueAsString(addr));
            } catch (Exception e) { 
                entity.setAddressJson("{}"); 
            }
        }
    }

    private CompanyResponse convertToResponse(GlobalCompany entity) {
        CompanyResponse res = new CompanyResponse();
        res.setId(entity.getId());
        res.setName(entity.getName());
        res.setWebsite(entity.getWebsite());
        res.setDescription(entity.getDescription());
        
        // Logic: If logoUrl exists in DB, use it. Otherwise, use first letter.
        if (entity.getLogoUrl() != null && !entity.getLogoUrl().trim().isEmpty()) {
            res.setLogo(entity.getLogoUrl());
        } else {
            res.setLogo(entity.getName() != null ? entity.getName().substring(0, 1) : "?");
        }
        
        res.setHeadquarters(entity.getHeadquarters());
        res.setFullAddress(entity.getFullAddress());
        try {
            res.setAddress_json(entity.getAddressJson() != null ? 
                mapper.readTree(entity.getAddressJson()) : null);
        } catch (Exception e) { 
            res.setAddress_json(null); 
        }
        return res;
    }
}