// EducationRecordRepository.java
package com.srots.repository;

import com.srots.model.EducationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRecordRepository extends JpaRepository<EducationRecord, String> {

    List<EducationRecord> findByStudentId(String studentId);

    List<EducationRecord> findByStudentIdOrderByLevelAsc(String studentId);

	void deleteByStudentId(String id);
}