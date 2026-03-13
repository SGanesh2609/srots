package com.srots.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.srots.config.CacheConfig;

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

@Service
public class CompanyServiceImpl implements CompanyService {

    @Autowired private GlobalCompanyRepository companyRepo;
    @Autowired private CollegeCompanySubscriptionRepository subRepo;
    @Autowired private CollegeRepository collegeRepo;
    @Autowired private ObjectMapper mapper;
    @Autowired private FileService fileService;

    @Override
    @Cacheable(value = CacheConfig.COMPANY_LIST, key = "#query + '_' + #collegeId + '_' + #linkedOnly", condition = "#query == null || #query.isBlank()")
    @Transactional(readOnly = true)
    public List<CompanyResponse> getCompanies(String query, String collegeId, boolean linkedOnly) {
        List<GlobalCompany> companies;

        // Debug incoming request
        System.out.println("getCompanies called | query='" + query + "' | collegeId='" + collegeId + 
                           "' | linkedOnly=" + linkedOnly);

        if (linkedOnly && collegeId != null && !collegeId.trim().isEmpty()) {
            System.out.println("→ Fetching SUBSCRIBED only for college: " + collegeId);
            final String q = (query != null && !query.trim().isEmpty()) ? query.trim().toLowerCase() : null;
            companies = subRepo.findByIdCollegeId(collegeId.trim()).stream()
                    .map(CollegeCompanySubscription::getCompany)
                    .filter(c -> q == null || (c.getName() != null && c.getName().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        } else if (query != null && !query.trim().isEmpty()) {
            companies = companyRepo.findByNameContainingIgnoreCase(query.trim());
        } else {
            System.out.println("→ Fetching ALL global companies");
            companies = companyRepo.findAll();
        }

        System.out.println("Found " + companies.size() + " raw companies");

        return companies.stream().map(company -> {
            CompanyResponse res = convertToResponse(company);

            // Enrich with subscription status when collegeId is provided
            if (collegeId != null && !collegeId.trim().isEmpty()) {
                String cleanCollege = collegeId.trim();
                String cleanCompany = company.getId().trim();

                SubscriptionId subId = new SubscriptionId(cleanCollege, cleanCompany);

                boolean isSub = subRepo.existsById(subId);

                // Debug per company
                System.out.println("  → Subscription check: college='" + cleanCollege + 
                                  "' company='" + cleanCompany + "' → isSubscribed=" + isSub);

                res.setSubscribed(isSub);
            } else {
                res.setSubscribed(false);
            }

            return res;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CompanyResponse> getCompaniesPaged(String query, String collegeId, boolean linkedOnly, Pageable pageable) {
        Page<GlobalCompany> page;

        if (linkedOnly && collegeId != null && !collegeId.isBlank()) {
            // Linked-only: fetch all subscriptions then optionally filter by query, then paginate in-memory
            String q = (query != null && !query.isBlank()) ? query.trim().toLowerCase() : null;
            List<GlobalCompany> linked = subRepo.findByIdCollegeId(collegeId.trim()).stream()
                    .map(CollegeCompanySubscription::getCompany)
                    .filter(c -> q == null || (c.getName() != null && c.getName().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
            // Simple in-memory pagination
            int total = linked.size();
            int start = (int) pageable.getOffset();
            int end   = Math.min(start + pageable.getPageSize(), total);
            List<GlobalCompany> slice = start >= total ? List.of() : linked.subList(start, end);
            page = new org.springframework.data.domain.PageImpl<>(slice, pageable, total);
        } else if (query != null && !query.isBlank()) {
            page = companyRepo.findByNameContainingIgnoreCase(query.trim(), pageable);
        } else {
            page = companyRepo.findAll(pageable);
        }

        // Collect subscription ids for enrichment in one query
        final String cleanCollege = (collegeId != null && !collegeId.isBlank()) ? collegeId.trim() : null;
        Set<String> subscribedIds = cleanCollege != null
                ? subRepo.findByIdCollegeId(cleanCollege).stream()
                        .map(s -> s.getCompany().getId())
                        .collect(Collectors.toSet())
                : Set.of();

        return page.map(company -> {
            CompanyResponse res = convertToResponse(company);
            res.setSubscribed(subscribedIds.contains(company.getId()));
            return res;
        });
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
        GlobalCompany company = companyRepo.findByNameIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with name: " + name));
        return convertToResponse(company);
    }

    @CacheEvict(value = CacheConfig.COMPANY_LIST, allEntries = true)
    @Transactional
    public CompanyResponse createCompany(CompanyRequest dto) {
        if (companyRepo.existsByNameIgnoreCase(dto.getName())) {
            throw new RuntimeException("Company '" + dto.getName() + "' already exists");
        }
        GlobalCompany company = new GlobalCompany();
        company.setId(UUID.randomUUID().toString());
        mapRequestToEntity(dto, company);
        return convertToResponse(companyRepo.save(company));
    }

    @CacheEvict(value = CacheConfig.COMPANY_LIST, allEntries = true)
    @Transactional
    public CompanyResponse updateCompany(String id, CompanyRequest dto) {
        GlobalCompany company = companyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));

        if (company.getLogoUrl() != null && dto.getLogoUrl() != null &&
            !company.getLogoUrl().equals(dto.getLogoUrl())) {
            fileService.deleteFile(company.getLogoUrl());
        }

        mapRequestToEntity(dto, company);
        return convertToResponse(companyRepo.save(company));
    }

    @CacheEvict(value = CacheConfig.COMPANY_LIST, allEntries = true)
    @Transactional
    public void deleteCompany(String id) {
        GlobalCompany company = companyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + id));

        if (company.getLogoUrl() != null) {
            fileService.deleteFile(company.getLogoUrl());
        }

        companyRepo.delete(company);
    }

    @CacheEvict(value = CacheConfig.COMPANY_LIST, allEntries = true)
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

    @CacheEvict(value = CacheConfig.COMPANY_LIST, allEntries = true)
    @Transactional
    public void unsubscribe(String collegeId, String companyId) {
        SubscriptionId id = new SubscriptionId(collegeId, companyId);
        if (subRepo.existsById(id)) {
            subRepo.deleteById(id);
        } else {
            throw new ResourceNotFoundException("Subscription not found");
        }
    }

    private void mapRequestToEntity(CompanyRequest dto, GlobalCompany entity) {
        entity.setName(dto.getName());
        entity.setWebsite(dto.getWebsite());
        entity.setDescription(dto.getDescription());
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