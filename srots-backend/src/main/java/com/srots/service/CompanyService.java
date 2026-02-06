package com.srots.service;

import com.srots.dto.CompanyRequest;
import com.srots.dto.CompanyResponse;
import com.srots.dto.SubscribeRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CompanyService {
//    Page<CompanyResponse> getCompanies(String query, String collegeId, Pageable pageable);
	public List<CompanyResponse> getCompanies(String query, String collegeId, boolean linkedOnly);
    CompanyResponse getCompanyById(String id);
    CompanyResponse getCompanyByName(String name);
    CompanyResponse createCompany(CompanyRequest dto);
    CompanyResponse updateCompany(String id, CompanyRequest dto);
    void deleteCompany(String id);
    void subscribe(SubscribeRequest dto);
    void unsubscribe(String collegeId, String companyId);
}