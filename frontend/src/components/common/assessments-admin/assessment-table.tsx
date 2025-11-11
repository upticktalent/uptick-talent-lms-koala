/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Box from '@/components/ui/box';
import { Assessment } from '@/types/assessments-admin';
import { reviewAssessmentAction } from '@/app/(dashboard)/admin/[activeCohort]/assessments/action';
import AssessmentFilters from './assessment-filters';
import AssessmentTableHeader from './assessment-table-header';
import AssessmentTableRow from './assessment-table-row';
import AssessmentPagination from './assessment-pagination';
import AssessmentMobile from './assessment-mobile';
import BulkUpdateModal from './bulk-update';
import { getApplicantName, getTrackName } from './assessment-utils';
import { AssessmentTableProps } from './assessment-types';
import AssessmentDetailsDialog from './assessment-details-dialog';

export default function AssessmentTable({ assessments: initialAssessments }: AssessmentTableProps) {
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [viewAssessment, setViewAssessment] = useState<Assessment | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    trackFilter: 'All',
    statusFilter: 'All',
    page: 1,
    pageSize: 10,
  });
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const tracks = useMemo(() => {
    return [
      'All',
      ...new Set(assessments.map(assessment => getTrackName(assessment)).filter(Boolean)),
    ];
  }, [assessments]);

  const statuses = useMemo(() => {
    return ['All', 'submitted', 'under-review', 'reviewed'];
  }, []);

  // Filtered and searched assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const fullName = getApplicantName(assessment).toLowerCase();
      const email = assessment.application.applicant?.email.toLowerCase() || '';
      const appId = assessment._id.toLowerCase();

      const matchesSearch =
        fullName.includes(filters.search.toLowerCase()) ||
        email.includes(filters.search.toLowerCase()) ||
        appId.includes(filters.search.toLowerCase());

      const matchesTrack =
        filters.trackFilter === 'All' ? true : getTrackName(assessment) === filters.trackFilter;
      const matchesStatus =
        filters.statusFilter === 'All' ? true : assessment.status === filters.statusFilter;

      return matchesSearch && matchesTrack && matchesStatus;
    });
  }, [assessments, filters.search, filters.trackFilter, filters.statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAssessments.length / filters.pageSize);
  const paginatedAssessments = filteredAssessments.slice(
    (filters.page - 1) * filters.pageSize,
    filters.page * filters.pageSize,
  );

  // pagination info
  const startItem = (filters.page - 1) * filters.pageSize + 1;
  const endItem = Math.min(filters.page * filters.pageSize, filteredAssessments.length);

  const handleSelectAssessment = (id: string, checked: boolean) => {
    setSelectedAssessments(prev =>
      checked ? [...prev, id] : prev.filter(assessmentId => assessmentId !== id),
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedAssessments(paginatedAssessments.map(a => a._id));
    else setSelectedAssessments([]);
  };

  const handleBulkUpdate = async (action: 'under-review' | 'reviewed') => {
    setIsBulkUpdating(true);
    const originalAssessments = [...assessments];

    setLoadingIds(prev => new Set([...prev, ...selectedAssessments]));

    // Optimistic update
    setAssessments(prev =>
      prev.map(a => (selectedAssessments.includes(a._id) ? { ...a, status: action } : a)),
    );

    try {
      await Promise.all(
        selectedAssessments.map(id => reviewAssessmentAction(id, action, 'Bulk update')),
      );

      setShowBulkModal(false);
      toast.success(
        `${selectedAssessments.length} assessment(s) ${action === 'under-review' ? 'marked for review' : 'reviewed'}!`,
      );
      setSelectedAssessments([]);
    } catch (error) {
      setAssessments(originalAssessments);
      toast.error('Failed to update some assessments');
    } finally {
      setIsBulkUpdating(false);
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        selectedAssessments.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: Assessment['status'],
    assessment: Assessment,
  ) => {
    if (newStatus === assessment.status) return;

    setLoadingIds(prev => new Set(prev).add(id));
    const originalAssessments = [...assessments];

    // Optimistic update
    setAssessments(prev => prev.map(app => (app._id === id ? { ...app, status: newStatus } : app)));

    try {
      let feedbackMessage = '';
      switch (newStatus) {
        case 'under-review':
          feedbackMessage = 'Assessment marked for review';
          break;
        case 'reviewed':
          feedbackMessage = 'Assessment reviewed';
          break;
        default:
          feedbackMessage = 'Status updated';
      }

      await reviewAssessmentAction(id, newStatus as 'under-review' | 'reviewed', feedbackMessage);

      if (newStatus === 'under-review') {
        toast.success(`${getApplicantName(assessment)}'s assessment marked as under review`);
      } else if (newStatus === 'reviewed') {
        toast.success(`${getApplicantName(assessment)}'s assessment has been reviewed`);
      } else {
        toast.info(`${getApplicantName(assessment)} status updated to ${newStatus}`);
      }
    } catch (error) {
      setAssessments(originalAssessments);
      toast.error(`Failed to update ${getApplicantName(assessment)}'s status`);
    } finally {
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleDownload = (assessment: Assessment) => {
    toast.success(`Downloading ${getApplicantName(assessment)}'s assessment...`);
    window.open(assessment.fileUrl, '_blank');
  };

  const handleFilterChange = (updates: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...updates, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      trackFilter: 'All',
      statusFilter: 'All',
      page: 1,
      pageSize: 10,
    });
  };

  const hasActiveFilters =
    filters.search || filters.trackFilter !== 'All' || filters.statusFilter !== 'All';
  const isAssessmentLoading = (id: string) => loadingIds.has(id);

  return (
    <Box className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <Box>
          <h1 className="text-xl sm:text-2xl font-semibold text-indigo-700">Assessment Review</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Review and evaluate submitted assessments
          </p>
        </Box>
        {selectedAssessments.length > 0 && (
          <Button
            onClick={() => setShowBulkModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white ml-auto cursor-pointer"
            size="sm"
            disabled={isBulkUpdating}
          >
            {isBulkUpdating ? 'Updating...' : `Bulk Update (${selectedAssessments.length})`}
          </Button>
        )}
      </Box>

      {/* Filters */}
      <AssessmentFilters
        search={filters.search}
        trackFilter={filters.trackFilter}
        statusFilter={filters.statusFilter}
        pageSize={filters.pageSize}
        tracks={tracks}
        statuses={statuses}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={value => handleFilterChange({ search: value })}
        onTrackFilterChange={value => handleFilterChange({ trackFilter: value })}
        onStatusFilterChange={value => handleFilterChange({ statusFilter: value })}
        onPageSizeChange={value => handleFilterChange({ pageSize: value })}
        onClearFilters={clearFilters}
      />

      {/* Desktop Table */}
      <Box className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Box className="overflow-x-auto">
          <Table>
            <AssessmentTableHeader
              selectedCount={selectedAssessments.length}
              totalCount={paginatedAssessments.length}
              onSelectAll={handleSelectAll}
            />
            <TableBody>
              {paginatedAssessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No assessments found. {hasActiveFilters && 'Try adjusting your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAssessments.map(assessment => (
                  <AssessmentTableRow
                    key={assessment._id}
                    assessment={assessment}
                    isSelected={selectedAssessments.includes(assessment._id)}
                    isLoading={isAssessmentLoading(assessment._id)}
                    onSelect={handleSelectAssessment}
                    onView={setViewAssessment}
                    onDownload={handleDownload}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* Mobile Table */}
      <AssessmentMobile
        assessments={paginatedAssessments}
        selectedAssessments={selectedAssessments}
        onSelectAssessment={handleSelectAssessment}
        onViewAssessment={setViewAssessment}
        onDownloadAssessment={handleDownload}
        onStatusChange={(id, status) => {
          const assessment = assessments.find(a => a._id === id);
          if (assessment) {
            handleStatusChange(id, status as Assessment['status'], assessment);
          }
        }}
        loadingIds={loadingIds}
      />

      {/* Pagination */}
      {filteredAssessments.length > 0 && (
        <AssessmentPagination
          currentPage={filters.page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          totalItems={filteredAssessments.length}
          onPageChange={page => setFilters(prev => ({ ...prev, page }))}
        />
      )}

      {/* View Assessment Dialog */}
      <AssessmentDetailsDialog
        assessment={viewAssessment}
        onClose={() => setViewAssessment(null)}
        onDownload={handleDownload}
        onStatusChange={handleStatusChange}
        loadingIds={loadingIds}
      />

      {/* Bulk Update Modal */}
      <BulkUpdateModal
        open={showBulkModal}
        onOpenChange={setShowBulkModal}
        selectedCount={selectedAssessments.length}
        onBulkUpdate={handleBulkUpdate}
        isUpdating={isBulkUpdating}
      />
    </Box>
  );
}
