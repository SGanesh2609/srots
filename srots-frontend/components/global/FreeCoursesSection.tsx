import React, { useState, useEffect } from 'react';
import { CompanyService } from '../../services/companyService';
import { FreeCourse, Role, User, CoursePlatform, CourseStatus } from '../../types';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface FreeCoursesSectionProps {
  user: User;
}

export const FreeCoursesSection: React.FC<FreeCoursesSectionProps> = ({ user }) => {
  const [courses, setCourses] = useState<FreeCourse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 12;

  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [technologies, setTechnologies] = useState<string[]>(['All']);
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

  const [moderatingCourse, setModeratingCourse] = useState<FreeCourse | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSrotsUser = user.role === Role.ADMIN || user.role === Role.SROTS_DEV;
  const isAdmin = user.role === Role.ADMIN;

  // Load filter metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [techs, plats] = await Promise.all([
          CompanyService.getCourseCategories(),
          CompanyService.getCoursePlatformsList(),
        ]);
        setTechnologies(['All', ...techs.filter((t) => t !== 'All')]);
        setPlatforms(['All', ...plats.filter((p) => p !== 'All')]);
      } catch (e) {
        console.error('Failed to load metadata', e);
      }
    };
    loadMetadata();
  }, []);

  const refreshCourses = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const effectiveStatus = isSrotsUser ? statusFilter : 'ACTIVE';

      const { courses, totalPages, totalElements } = await CompanyService.searchFreeCourses(
        search,
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
      console.error('Failed to fetch courses:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load courses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load + filter/page change
  useEffect(() => {
    refreshCourses();
  }, [search, techFilter, platformFilter, statusFilter, currentPage, user.role, isSrotsUser]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [search, techFilter, platformFilter, statusFilter]);

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
      await refreshCourses();
    } catch (err) {
      console.error('Toggle status failed', err);
    }
  };

  const handleVerifyLink = async (id: string) => {
    setVerifyingId(id);
    try {
      await CompanyService.verifyFreeCourseLink(id);
      await refreshCourses();
    } catch (err) {
      console.error('Verify link failed', err);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSoftDelete = async () => {
    if (!moderatingCourse) return;
    try {
      await CompanyService.softDeleteFreeCourse(moderatingCourse.id);
      await refreshCourses();
    } catch (err) {
      console.error('Soft delete failed', err);
    }
    setModeratingCourse(null);
  };

  const handleHardDelete = async () => {
    if (!moderatingCourse || !isAdmin) return;
    try {
      await CompanyService.hardDeleteFreeCourse(moderatingCourse.id);
      await refreshCourses();
    } catch (err) {
      console.error('Hard delete failed', err);
    }
    setModeratingCourse(null);
  };

//   const handleSave = async () => {
//     if (!courseForm.name || !courseForm.link || !courseForm.technology) {
//       alert('Required: Name, Link, Technology');
//       return;
//     }

//     try {
//       if (editingCourse) {
//         await CompanyService.updateFreeCourse({ ...editingCourse, ...courseForm } as FreeCourse);
//       } else {
//         await CompanyService.createFreeCourse(courseForm, user.fullName || 'Unknown');
//       }

//       // Refresh categories & courses
//       const freshTechs = await CompanyService.getCourseCategories();
//       setTechnologies(['All', ...freshTechs.filter((t) => t !== 'All')]);
//       await refreshCourses();
//       setShowModal(false);
//     } catch (err) {
//       console.error('Save failed', err);
//       alert('Failed to save course.');
//     }
//   };
    // ... imports and states unchanged ...

    const handleSave = async () => {
        if (!courseForm.name?.trim() || !courseForm.link?.trim() || !courseForm.technology?.trim()) {
            alert('Required fields: Name, Link, Technology');
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

            // Refresh metadata and list
            const freshTechs = await CompanyService.getCourseCategories();
            setTechnologies(['All', ...freshTechs.filter((t) => t !== 'All')]);
            await refreshCourses();
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

            alert(userMessage);
        }
    };

// ... rest of the component remains the same ...

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
    <div className="space-y-6 animate-in fade-in">
      {/* Header + Add button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Learning Resources</h2>
          <p className="text-sm text-gray-500 font-medium">Premium verified courses for career advancement.</p>
        </div>
        {isSrotsUser && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-100 transition-all active:scale-95 text-sm"
          >
            <Plus size={18} /> Add Global Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-100 outline-none bg-gray-50/50 text-gray-900 border-gray-200 placeholder:text-gray-400"
            placeholder="Search by topic, platform, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-4">
          {/* Technology */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-20 shrink-0">Technology</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {technologies.map((tech) => (
                <button
                  key={tech}
                  onClick={() => setTechFilter(tech)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                    techFilter === tech
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-20 shrink-0">Platform</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                    platformFilter === p
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility (admin only) */}
          {isSrotsUser && (
            <div className="flex items-center gap-4 border-t pt-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest w-20 shrink-0">Visibility</span>
              <div className="flex gap-2">
                {['All', 'ACTIVE', 'INACTIVE'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      statusFilter === s
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center">
          {errorMessage}
        </div>
      )}

      {/* Grid + Loading overlay */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        )}

        {courses.map((course) => (
          <div
            key={course.id}
            className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all relative group overflow-hidden flex flex-col h-full ${
              course.status === CourseStatus.INACTIVE ? 'opacity-75 bg-gray-50/50 border-dashed border-2' : ''
            }`}
          >
            {isSrotsUser && (
              <div className="absolute top-3 right-3 flex gap-1 z-10">
                <button
                  onClick={() => handleToggleStatus(course)}
                  className={`p-1.5 rounded-lg border bg-white shadow-sm transition-colors ${
                    course.status === CourseStatus.ACTIVE
                      ? 'text-green-600 border-green-100 hover:bg-green-50'
                      : 'text-gray-400 border-gray-200 hover:bg-gray-100'
                  }`}
                  title="Toggle Status"
                >
                  <Power size={14} />
                </button>
                <button
                  onClick={() => handleVerifyLink(course.id)}
                  className={`p-1.5 rounded-lg border bg-white shadow-sm transition-colors ${
                    verifyingId === course.id ? 'animate-pulse text-blue-400' : 'text-blue-600 border-blue-100 hover:bg-blue-50'
                  }`}
                  title="Verify Link"
                >
                  <ShieldCheck size={14} />
                </button>
                <button
                  onClick={() => handleOpenEdit(course)}
                  className="p-1.5 rounded-lg border border-gray-100 bg-white shadow-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setModeratingCourse(course)}
                  className="p-1.5 rounded-lg border border-gray-100 bg-white shadow-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {/* Card content */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <BookOpen size={24} />
                </div>
                {course.status === CourseStatus.INACTIVE && (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-extrabold rounded uppercase tracking-wider flex items-center gap-1">
                    <X size={10} /> Inactive
                  </span>
                )}
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                  {course.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                    {course.technology}
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 flex items-center gap-1 uppercase">
                    {getPlatformIcon(course.platform)} {course.platform}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px] leading-relaxed">{course.description}</p>

              <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Added By</p>
                  <p className="text-xs font-bold text-gray-700">{course.postedBy}</p>
                </div>
                {course.lastVerifiedAt && isSrotsUser && (
                  <div className="text-right space-y-0.5">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Last Check</p>
                    <p className="text-[10px] font-mono text-green-600 font-bold">
                      {course.lastVerifiedAt}
                    </p>
                  </div>
                )}
              </div>

              <a
                href={course.link}
                target="_blank"
                rel="noreferrer"
                className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
              >
                Start Learning <ExternalLink size={16} />
              </a>
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
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={currentPage === 0 || isLoading}
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            className="p-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm font-medium text-gray-700">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages - 1 || isLoading}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-2 rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
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
                    {p}
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