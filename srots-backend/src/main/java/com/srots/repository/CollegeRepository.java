package com.srots.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.srots.model.College;

@Repository
public interface CollegeRepository extends JpaRepository<College, String> {

	@Query("SELECT c FROM College c WHERE :q IS NULL OR " + "LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR "
			+ "LOWER(c.code) LIKE LOWER(CONCAT('%', :q, '%'))")
	List<College> searchColleges(@Param("q") String query);

	boolean existsByCode(String code);

	boolean existsByCodeAndIdNot(String code, String id);

//	Page<College> searchColleges(String query, boolean includeInactive, Pageable pageable);

	@Query("SELECT c FROM College c WHERE (:query IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.code) LIKE LOWER(CONCAT('%', :query, '%'))) AND (:includeInactive = true OR c.active = true)")
	Page<College> searchColleges(String query, boolean includeInactive, Pageable pageable);

	boolean existsByEmail(String email);

	boolean existsByPhone(String phone);

	boolean existsByLandline(String landline);

	@Query("""
			    SELECT new com.srots.dto.analytics.LeaderboardDTO(
			        c.name,
			        '0%',
			        COUNT(j.id)
			    )
			    FROM College c
			    LEFT JOIN c.jobs j
			    GROUP BY c.id, c.name
			""")
	List<com.srots.dto.analytics.LeaderboardDTO> getLeaderboard();

//	@Query(value = "SELECT jt.name AS name, COUNT(*) AS count " + "FROM colleges c "
//			+ "CROSS JOIN JSON_TABLE(c.branches, '$[*]' COLUMNS (name VARCHAR(255) PATH '$')) AS jt "
//			+ "WHERE c.branches IS NOT NULL " + "GROUP BY jt.name", nativeQuery = true)
//	List<Object[]> getBranchDistributionFromColleges();
//
//	@Query(value = "SELECT jt.name AS name, COUNT(*) AS count " + "FROM colleges c "
//			+ "CROSS JOIN JSON_TABLE(c.branches, '$[*]' COLUMNS (name VARCHAR(255) PATH '$')) AS jt "
//			+ "WHERE c.id = :collegeId AND c.branches IS NOT NULL " + "GROUP BY jt.name", nativeQuery = true)
//	List<Object[]> getBranchDistributionByCollegeId(@Param("collegeId") String collegeId);

	// I have deleted the countByCollegeIdAndRole line from here completely.
}