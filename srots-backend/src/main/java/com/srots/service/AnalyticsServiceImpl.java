package com.srots.service;

import com.srots.dto.analytics.*;
import com.srots.model.User;
import com.srots.repository.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsServiceImpl.class);

    @Autowired private StudentAnalyticsRepository     studentRepo;
    @Autowired private JobAnalyticsRepository         jobRepo;
    @Autowired private ApplicationAnalyticsRepository appRepo;
    @Autowired private UserRepository                 userRepo;
    @Autowired private CollegeRepository              collegeRepo;
    @Autowired private JobMapper                      jobMapper;

    // ── Overview (system-wide) ────────────────────────────────────────────────

    @Override
    public AnalyticsOverviewDTO getOverview() {
        try {
            List<BranchDistributionDTO> branchData    = safeList(studentRepo.getBranchDistribution());
            List<PlacementProgressDTO>  progressData  = safeList(appRepo.getMonthlyPlacements(com.srots.model.Application.AppStatus.PLACED));
            List<JobTypeDTO>            jobTypes      = safeList(jobRepo.getJobTypeDistribution());

            Long   totalStudents  = safeCount(appRepo.countTotalStudents(com.srots.model.User.Role.STUDENT));
            Long   placedStudents = safeCount(appRepo.countPlacedStudents(com.srots.model.Application.AppStatus.PLACED));
            Double rate           = totalStudents > 0 ? (placedStudents * 100.0) / totalStudents : 0.0;

            StatsDTO stats = StatsDTO.builder()
                    .totalStudents(totalStudents)
                    .placedStudents(placedStudents)
                    .placementRate(rate)
                    .companiesVisited(25L)
                    .build();

            List<com.srots.dto.jobdto.JobResponseDTO> recentJobs = safeList(jobRepo.findTop5ByOrderByPostedAtDesc())
                    .stream()
                    .map(job -> jobMapper.toResponseDTO(job, null, "ADMIN"))
                    .collect(Collectors.toList());

            return AnalyticsOverviewDTO.builder()
                    .branchDistribution(branchData)
                    .placementProgress(progressData)
                    .jobTypes(jobTypes)
                    .stats(stats)
                    .recentJobs(recentJobs)
                    .build();

        } catch (Exception e) {
            log.error("Error in getOverview(): {}", e.getMessage(), e);
            throw e;
        }
    }

    // ── Overview (college-scoped) ─────────────────────────────────────────────

    @Override
    public AnalyticsOverviewDTO getOverviewByCollege(String collegeId) {
        try {
            List<BranchDistributionDTO> branchData    = safeList(studentRepo.getBranchDistributionByCollege(collegeId));
            List<PlacementProgressDTO>  progressData  = safeList(appRepo.getMonthlyPlacementsByCollege(com.srots.model.Application.AppStatus.PLACED, collegeId));
            List<JobTypeDTO>            jobTypes      = safeList(jobRepo.getJobTypeDistributionByCollege(collegeId));

            Long   totalStudents  = safeCount(appRepo.countTotalStudentsByCollege(com.srots.model.User.Role.STUDENT, collegeId));
            Long   placedStudents = safeCount(appRepo.countPlacedStudentsByCollege(com.srots.model.Application.AppStatus.PLACED, collegeId));
            Double rate           = totalStudents > 0 ? (placedStudents * 100.0) / totalStudents : 0.0;

            Long companiesVisited = safeList(jobRepo.findTop5ByCollege_IdOrderByPostedAtDesc(collegeId))
                    .stream()
                    .map(j -> j.getCompanyName())
                    .filter(c -> c != null)
                    .distinct()
                    .count();

            StatsDTO stats = StatsDTO.builder()
                    .totalStudents(totalStudents)
                    .placedStudents(placedStudents)
                    .placementRate(rate)
                    .companiesVisited(companiesVisited)
                    .build();

            List<com.srots.dto.jobdto.JobResponseDTO> recentJobs = safeList(jobRepo.findTop5ByCollege_IdOrderByPostedAtDesc(collegeId))
                    .stream()
                    .map(job -> jobMapper.toResponseDTO(job, null, "CPH"))
                    .collect(Collectors.toList());

            return AnalyticsOverviewDTO.builder()
                    .branchDistribution(branchData)
                    .placementProgress(progressData)
                    .jobTypes(jobTypes)
                    .stats(stats)
                    .recentJobs(recentJobs)
                    .build();

        } catch (Exception e) {
            log.error("Error in getOverviewByCollege({}): {}", collegeId, e.getMessage(), e);
            throw e;
        }
    }

    // ── System analytics (admin) ──────────────────────────────────────────────

    @Override
    public SystemAnalyticsDTO getSystemAnalytics() {
        try {
            long totalColleges  = collegeRepo.count();
            long activeStudents = userRepo.countByRole(User.Role.STUDENT);
            long totalJobs      = jobRepo.count();

            java.time.LocalDate next30 = java.time.LocalDate.now().plusDays(30);
            long expiringAccounts = safeList(studentRepo.findAll()).stream()
                    .filter(s -> s.getPremiumEndDate() != null && s.getPremiumEndDate().isBefore(next30))
                    .count();

            SystemStatsDTO stats = SystemStatsDTO.builder()
                    .totalColleges(totalColleges)
                    .activeStudents(activeStudents)
                    .expiringAccounts(expiringAccounts)
                    .totalJobs(totalJobs)
                    .build();

            List<LeaderboardDTO>        leaderboard  = safeList(collegeRepo.getLeaderboard());
            List<BranchDistributionDTO> branchData   = safeList(studentRepo.getBranchDistribution());
            List<PlacementProgressDTO>  progressData = safeList(appRepo.getMonthlyPlacements(com.srots.model.Application.AppStatus.PLACED));

            return SystemAnalyticsDTO.builder()
                    .stats(stats)
                    .leaderboard(leaderboard)
                    .placementProgress(progressData)
                    .branchDistribution(branchData)
                    .build();

        } catch (Exception e) {
            log.error("Error in getSystemAnalytics(): {}", e.getMessage(), e);
            throw e;
        }
    }

    // ── Null-safety helpers ───────────────────────────────────────────────────

    private <T> List<T> safeList(List<T> list) {
        return list != null ? list : new ArrayList<>();
    }

    private Long safeCount(Long value) {
        return value != null ? value : 0L;
    }
}