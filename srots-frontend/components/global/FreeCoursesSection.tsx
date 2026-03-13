import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CompanyService } from '../../services/companyService';
import { FreeCourse, Role, User, CoursePlatform, CourseStatus } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../common/Toast';
import {
  Search,
  Plus,
  BookOpen,
  ExternalLink,
  Edit2,
  Trash2,
  Youtube,
  Globe,
  Power,
  ShieldCheck,
  MonitorPlay,
  Video,
  Layout,
  MoreHorizontal,
  AlertTriangle,
  Info,
  X,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Pagination } from '../common/Pagination';
import { Modal } from '../common/Modal';

interface FreeCoursesSectionProps {
  user: User;
}

export const FreeCoursesSection: React.FC<FreeCoursesSectionProps> = ({ user }) => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const abortRef = useRef<AbortController | null>(null);

  const [courses, setCourses] = useState<FreeCourse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => {
    const pg = parseInt(searchParams.get('fcpg') ?? '0', 10);
    return isNaN(pg) || pg < 0 ? 0 : pg;
  });
  const pageSize = 12;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [techFilter, setTechFilter] = useState(() => searchParams.get('fctech') || 'All');
  const [platformFilter, setPlatformFilter] = useState(() => searchParams.get('fcplat') || 'All');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('fcvis') || 'All');

  const [technologies, setTechnologies] = useState<string[]>(['All']);
  const [techCounts, setTechCounts] = useState<Record<string, number>>({});
  const [platforms, setPlatforms] = useState<string[]>(['All']);

  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<FreeCourse | null>(null);
  const [courseForm, setCourseForm] = useState<Partial<FreeCourse>>({
    name: '',
    technology: '',
    platform: CoursePlatform.OTHER,
    description: '',
    link: '',
    status: CourseStatus.ACTIVE,
  });

  const [detailCourse, setDetailCourse] = useState<FreeCourse | null>(null);
  const [moderatingCourse, setModeratingCourse] = useState<FreeCourse | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSrotsUser = user.role === Role.ADMIN || user.role === Role.SROTS_DEV;
  const isAdmin = user.role === Role.ADMIN;

  // Load filter metadata — allSettled so one failure doesn't block the other
  useEffect(() => {
    const loadMetadata = async () => {
      const [techCountsResult, platsResult] = await Promise.allSettled([
        CompanyService.getCourseTechCounts(),
        CompanyService.getCoursePlatformsList(),
      ]);
      if (techCountsResult.status === 'fulfilled') {
        const counts = techCountsResult.value;
        setTechCounts(counts);
        setTechnologies(['All', ...Object.keys(counts)]);
      } else {
        console.error('Failed to load course tech counts', techCountsResult.reason);
      }
      if (platsResult.status === 'fulfilled') {
        setPlatforms(['All', ...platsResult.value.filter((p) => p !== 'All')]);
      } else {
        console.error('Failed to load platforms', platsResult.reason);
      }
    };
    loadMetadata();
  }, []);

  const refreshCourses = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const effectiveStatus = isSrotsUser ? statusFilter : 'ACTIVE';

      const { courses, totalPages, totalElements } = await CompanyService.searchFreeCourses(
        debouncedSearch,
        techFilter,
        platformFilter,
        effectiveStatus,
        currentPage,
        pageSize,
        isSrotsUser
      );

      setCourses(courses);
      setTotalPages(totalPages);
      setTotalElements(totalElements);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      console.error('Failed to fetch courses:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, techFilter, platformFilter, statusFilter, currentPage, isSrotsUser]);

  // Initial load + filter/page change
  useEffect(() => {
    refreshCourses();
    return () => { abortRef.current?.abort(); };
  }, [refreshCourses]);

  // Reset to page 0 when filters (debounced) change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, techFilter, platformFilter, statusFilter]);

  // Sync filter state to URL
  const syncToUrl = (tech: string, plat: string, vis: string, pg: number) => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev);
      if (tech && tech !== 'All') p.set('fctech', tech); else p.delete('fctech');
      if (plat && plat !== 'All') p.set('fcplat', plat); else p.delete('fcplat');
      if (vis && vis !== 'All') p.set('fcvis', vis); else p.delete('fcvis');
      if (pg > 0) p.set('fcpg', String(pg)); else p.delete('fcpg');
      return p;
    }, { replace: true });
  };

  const handleTechFilter = (tech: string) => {
    setTechFilter(tech);
    syncToUrl(tech, platformFilter, statusFilter, 0);
  };

  const handlePlatformFilter = (plat: string) => {
    setPlatformFilter(plat);
    syncToUrl(techFilter, plat, statusFilter, 0);
  };

  const handleStatusFilter = (vis: string) => {
    setStatusFilter(vis);
    syncToUrl(techFilter, platformFilter, vis, 0);
  };

  const handlePageChange = (pg: number) => {
    setCurrentPage(pg);
    syncToUrl(techFilter, platformFilter, statusFilter, pg);
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setCourseForm({
      name: '',
      technology: '',
      platform: CoursePlatform.OTHER,
      description: '',
      link: '',
      status: CourseStatus.ACTIVE,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (course: FreeCourse) => {
    setEditingCourse(course);
    setCourseForm(course);
    setShowModal(true);
  };

  const handleToggleStatus = async (course: FreeCourse) => {
    const newStatus = course.status === CourseStatus.ACTIVE ? CourseStatus.INACTIVE : CourseStatus.ACTIVE;
    try {
      await CompanyService.updateFreeCourseStatus(course.id, newStatus);
      toast.success(`Course ${newStatus === CourseStatus.ACTIVE ? 'activated' : 'deactivated'} successfully.`);
      await refreshCourses();
    } catch (err) {
      toast.error('Failed to update course status. Please try again.');
    }
  };

  const handleVerifyLink = async (id: string) => {
    setVerifyingId(id);
    try {
      await CompanyService.verifyFreeCourseLink(id);
      toast.success('Course link verified successfully.');
      await refreshCourses();
    } catch (err) {
      toast.error('Failed to verify course link. Please try again.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSoftDelete = async () => {
    if (!moderatingCourse) return;
    try {
      await CompanyService.softDeleteFreeCourse(moderatingCourse.id);
      toast.success('Course removed successfully.');
      await refreshCourses();
    } catch (err) {
      toast.error('Failed to remove course. Please try again.');
    }
    setModeratingCourse(null);
  };

  const handleHardDelete = async () => {
    if (!moderatingCourse || !isAdmin) return;
    try {
      await CompanyService.hardDeleteFreeCourse(moderatingCourse.id);
      toast.success('Course permanently deleted.');
      await refreshCourses();
    } catch (err) {
      toast.error('Failed to permanently delete course. Please try again.');
    }
    setModeratingCourse(null);
  };

    const handleSave = async () => {
        if (!courseForm.name?.trim() || !courseForm.link?.trim() || !courseForm.technology?.trim()) {
            toast.warning('Required fields: Name, Link, and Technology.');
            return;
        }

        // Normalize platform to uppercase string (safety)
        const normalizedForm = {
            ...courseForm,
            platform: courseForm.platform ? String(courseForm.platform).toUpperCase() : CoursePlatform.OTHER,
            // Do NOT send status when creating — backend sets ACTIVE
        };

        try {
            if (editingCourse) {
            // Update: send full object including id
            await CompanyService.updateFreeCourse({
                ...editingCourse,
                ...normalizedForm,
            } as FreeCourse);
            } else {
            // Create: send only the fields backend expects
            await CompanyService.createFreeCourse(normalizedForm);
            }

            // Refresh tech counts and list
            const freshCounts = await CompanyService.getCourseTechCounts();
            setTechCounts(freshCounts);
            setTechnologies(['All', ...Object.keys(freshCounts)]);
            await refreshCourses();
            toast.success(editingCourse ? 'Course updated successfully.' : 'Course added successfully.');
            setShowModal(false);
        } catch (err: any) {
            console.error('Save operation failed:', err);

            let userMessage = 'Failed to save course.';

            if (err.response?.status === 400) {
            // Try to show meaningful backend message
            const backendMsg = err.response.data?.message 
                || err.response.data?.error 
                || 'Invalid data sent to server (check required fields or format)';
            userMessage = `Save failed: ${backendMsg}`;
            } else if (err.response?.status === 403) {
            userMessage = 'Permission denied. You may not have rights to create courses.';
            } else if (err.response?.status >= 500) {
            userMessage = 'Server error occurred. Please try again later or contact support.';
            }

            toast.error(userMessage);
        }
    };

  const PLATFORM_LABELS: Record<string, string> = {
    YOUTUBE: 'YouTube', UDEMY: 'Udemy', COURSERA: 'Coursera', LINKEDIN: 'LinkedIn', OTHER: 'Other',
  };
  const formatPlatform = (p: string) => PLATFORM_LABELS[p] ?? p.charAt(0) + p.slice(1).toLowerCase();

  const getPlatformIcon = (platform: CoursePlatform) => {
    switch (platform) {
      case CoursePlatform.YOUTUBE:
        return <Youtube size={16} className="text-red-600" />;
      case CoursePlatform.COURSERA:
        return <Video size={16} className="text-blue-600" />;
      case CoursePlatform.UDEMY:
        return <MonitorPlay size={16} className="text-purple-600" />;
      case CoursePlatform.LINKEDIN:
        return <Layout size={16} className="text-blue-700" />;
      default:
        return <Globe size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-2 animate-in fade-in">
      {/* Compact header + search bar on one row */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-gray-700 shrink-0">Learning Resources</h2>
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            className="w-full pl-7 pr-3 py-1.5 border rounded-lg text-xs focus:ring-1 focus:ring-blue-200 outline-none bg-gray-50 text-gray-900 border-gray-200 placeholder:text-gray-400"
            placeholder="Search topic, platform, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isSrotsUser && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-xs shrink-0 transition-all"
          >
            <Plus size={12} /> Add
          </button>
        )}
      </div>

      {/* Compact filter row */}
      <div className="bg-white px-3 py-2 rounded-xl border shadow-sm flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {/* Technology pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest shrink-0">Tech</span>
          {technologies.map((tech) => {
            const count = tech !== 'All' ? (techCounts[tech] ?? 0) : null;
            return (
              <button
                key={tech}
                onClick={() => handleTechFilter(tech)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all flex items-center gap-0.5 ${
                  techFilter === tech
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tech}
                {count !== null && count >= 2 && (
                  <span className={`text-[8px] font-extrabold px-0.5 rounded ${techFilter === tech ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="w-px h-4 bg-gray-200 shrink-0" />

        {/* Platform pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest shrink-0">Platform</span>
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => handlePlatformFilter(p)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all ${
                platformFilter === p
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p === 'All' ? 'All' : formatPlatform(p)}
            </button>
          ))}
        </div>

        {/* Visibility (admin only) */}
        {isSrotsUser && (
          <>
            <div className="w-px h-4 bg-gray-200 shrink-0" />
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest shrink-0">Vis</span>
              {['All', 'ACTIVE', 'INACTIVE'].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusFilter(s)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                    statusFilter === s
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs text-center">
          {errorMessage}
        </div>
      )}

      {/* Grid + Loading overlay */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        )}

        {courses.map((course) => (
          <div
            key={course.id}
            className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all relative group flex flex-col ${
              course.status === CourseStatus.INACTIVE ? 'opacity-70 bg-gray-50/50 border-dashed border-2' : ''
            }`}
          >
            {/* Admin controls — visible on hover */}
            {isSrotsUser && (
              <div className="absolute top-2 right-2 flex gap-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleToggleStatus(course)}
                  className={`p-1 rounded border bg-white shadow-sm transition-colors ${course.status === CourseStatus.ACTIVE ? 'text-green-600 border-green-100' : 'text-gray-400 border-gray-200'}`}
                  title="Toggle Status"><Power size={11} /></button>
                <button onClick={() => handleVerifyLink(course.id)}
                  className={`p-1 rounded border bg-white shadow-sm transition-colors ${verifyingId === course.id ? 'animate-pulse text-blue-400' : 'text-blue-600 border-blue-100'}`}
                  title="Verify Link"><ShieldCheck size={11} /></button>
                <button onClick={() => handleOpenEdit(course)}
                  className="p-1 rounded border border-gray-100 bg-white shadow-sm text-gray-500 hover:text-blue-600"><Edit2 size={11} /></button>
                <button onClick={() => setModeratingCourse(course)}
                  className="p-1 rounded border border-gray-100 bg-white shadow-sm text-gray-500 hover:text-red-600"><Trash2 size={11} /></button>
              </div>
            )}

            {/* Compact card body */}
            <div className="p-3 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 shrink-0">
                  <BookOpen size={14} />
                </div>
                {course.status === CourseStatus.INACTIVE && (
                  <span className="text-[9px] font-extrabold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase">Off</span>
                )}
              </div>

              <h3 className="font-bold text-xs text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                {course.name}
              </h3>

              <div className="flex flex-wrap gap-1 mb-3">
                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase truncate max-w-[80px]">
                  {course.technology}
                </span>
                <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 flex items-center gap-0.5 uppercase">
                  {getPlatformIcon(course.platform)} {formatPlatform(String(course.platform))}
                </span>
              </div>

              <div className="mt-auto flex flex-col gap-1.5">
                <button
                  onClick={() => setDetailCourse(course)}
                  className="w-full py-1.5 rounded-lg bg-gray-50 text-gray-700 font-bold text-[10px] border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  See more →
                </button>
                <a
                  href={course.link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 hover:bg-blue-700 transition-all active:scale-[0.98]"
                >
                  Start <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <MoreHorizontal size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium text-lg">
              {errorMessage ? 'Error loading courses' : 'No matching courses found'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        itemLabel="courses"
      />

      {/* Course Detail Modal */}
      {detailCourse && (
        <Modal
          isOpen={!!detailCourse}
          onClose={() => setDetailCourse(null)}
          title={
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><BookOpen size={18} /></div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{detailCourse.name}</h4>
                <p className="text-[10px] text-gray-500 font-medium">Course Details</p>
              </div>
            </div>
          }
          maxWidth="max-w-lg"
        >
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 uppercase">
                {detailCourse.technology}
              </span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 flex items-center gap-1 uppercase">
                {getPlatformIcon(detailCourse.platform)} {formatPlatform(String(detailCourse.platform))}
              </span>
              {detailCourse.status === CourseStatus.INACTIVE && (
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full uppercase">Inactive</span>
              )}
            </div>

            {detailCourse.description && (
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border">
                {detailCourse.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
              <span>Added by: <span className="font-bold text-gray-700">{detailCourse.postedBy}</span></span>
              {detailCourse.lastVerifiedAt && isSrotsUser && (
                <span className="text-green-600 font-bold font-mono text-[10px]">✓ {String(detailCourse.lastVerifiedAt).split('T')[0]}</span>
              )}
            </div>

            <a
              href={detailCourse.link}
              target="_blank"
              rel="noreferrer"
              className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              Start Learning <ExternalLink size={16} />
            </a>
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCourse ? 'Update Learning Resource' : 'Add New Resource'}
        maxWidth="max-w-md"
      >
        <div className="flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
              Resource Name *
            </label>
            <input
              className="w-full p-2.5 border rounded-xl bg-gray-50 text-gray-900 border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              value={courseForm.name || ''}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              placeholder="e.g. Java Spring Boot for Microservices"
            />
          </div>

          {/* Technology + Platform */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                Category *
              </label>
              <input
                className="w-full p-2.5 border rounded-xl bg-gray-50 text-gray-900 border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={courseForm.technology || ''}
                onChange={(e) => setCourseForm({ ...courseForm, technology: e.target.value })}
                placeholder="e.g. Backend"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                Platform
              </label>
              <select
                className="w-full p-2.5 border rounded-xl bg-gray-50 text-gray-900 border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none font-bold text-xs"
                value={courseForm.platform || CoursePlatform.OTHER}
                onChange={(e) => setCourseForm({ ...courseForm, platform: e.target.value as CoursePlatform })}
              >
                {(Object.values(CoursePlatform) as string[]).map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABELS[p] ?? p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
              Direct Link *
            </label>
            <input
              className="w-full p-2.5 border rounded-xl bg-gray-50 text-gray-900 border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              value={courseForm.link || ''}
              onChange={(e) => setCourseForm({ ...courseForm, link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
              Short Description
            </label>
            <textarea
              className="w-full p-2.5 border rounded-xl bg-gray-50 text-gray-900 border-gray-200 focus:ring-2 focus:ring-blue-100 outline-none resize-none transition-all"
              rows={4}
              value={courseForm.description || ''}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              placeholder="Briefly describe what this resource covers..."
            />
          </div>

          {/* Status selector */}
          <div className="bg-blue-50/50 p-4 rounded-xl flex items-center justify-between border border-blue-100">
            <div className="pr-4">
              <p className="text-xs font-bold text-blue-900 flex items-center gap-1">
                <Info size={14} /> Global Status
              </p>
              <p className="text-[10px] text-blue-600">Toggle visibility for college-level users.</p>
            </div>
            <select
              className={`p-1.5 rounded-lg text-[10px] font-bold border outline-none ${
                courseForm.status === CourseStatus.ACTIVE
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
              value={courseForm.status || CourseStatus.ACTIVE}
              onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value as CourseStatus })}
            >
              <option value={CourseStatus.ACTIVE}>ACTIVE</option>
              <option value={CourseStatus.INACTIVE}>INACTIVE</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex-none">
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
          >
            {editingCourse ? 'Save Changes' : 'Publish Resource'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!moderatingCourse}
        onClose={() => setModeratingCourse(null)}
        title="Manage Deletion Workflow"
        maxWidth="max-w-sm"
      >
        <div className="p-6 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 text-lg">Unpublish {moderatingCourse?.name}?</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Soft delete hides the resource from students but preserves the data.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleSoftDelete}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all border flex items-center justify-center gap-2"
            >
              <Power size={18} className="text-orange-500" />
              {moderatingCourse?.status === CourseStatus.ACTIVE
                ? 'Soft Delete (Make Inactive)'
                : 'Stay Inactive'}
            </button>

            {isAdmin ? (
              <button
                onClick={handleHardDelete}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-100 flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Permanent Global Deletion
              </button>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg border border-dashed text-[10px] text-gray-400 italic">
                Super Admin role required for hard deletion.
              </div>
            )}
          </div>
          <button
            onClick={() => setModeratingCourse(null)}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest mt-2 flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <X size={12} /> Cancel Action
          </button>
        </div>
      </Modal>
    </div>
  );
};