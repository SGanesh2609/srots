package com.srots.service;

import java.util.List;

import com.srots.dto.CompanyRequest;
import com.srots.dto.CompanyResponse;
import com.srots.dto.SubscribeRequest;

public interface CompanyService {
	
	public List<CompanyResponse> getCompanies(String query, String collegeId);
	public CompanyResponse getCompanyById(String id);
	public CompanyResponse getCompanyByName(String name);
	
	public CompanyResponse createCompany(CompanyRequest dto);
	public CompanyResponse updateCompany(String id, CompanyRequest dto);
	public void subscribe(SubscribeRequest dto);
	public void unsubscribe(String collegeId, String companyId);
	public void deleteCompany(String id);
	
	

}
