// ApplicationRepository.java
package com.srots.repository;

import com.srots.model.Application;
import com.srots.model.Application.AppStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, String> {

    List<Application> findByStudentId(String studentId);

    List<Application> findByStudentIdOrderByAppliedAtDesc(String studentId);

    List<Application> findByJobIdOrderByAppliedAtAsc(String jobId);
    
    Optional<Application> findByJobIdAndStudentId(String jobId, String studentId);
    List<Application> findByJobId(String jobId);
    long countByJobIdAndCurrentRoundStatus(String jobId, String status);

	long countByJobId(String id);
	
	
	// Count students currently in or past a specific round with a specific status
    long countByJobIdAndCurrentRoundAndStatus(String jobId, Integer currentRound, Application.AppStatus status);

    // Count specifically based on the currentRoundStatus string (e.g., "Round 1 Cleared")
    long countByJobIdAndCurrentRoundAndCurrentRoundStatusContaining(String jobId, Integer currentRound, String statusPart);

	long countByJobIdAndStatus(String jobId, AppStatus hired);

	boolean existsByJobIdAndCurrentRoundGreaterThan(String jobId, int roundNum);

	boolean existsByJobIdAndCurrentRoundAndCurrentRoundStatusContaining(String jobId, int prevRound, String string);
	
}