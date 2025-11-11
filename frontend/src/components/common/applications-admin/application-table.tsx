/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Box from '@/components/ui/box';
import { Applicant } from '@/types/assessments-admin';
import { reviewApplicationAction } from '@/app/(dashboard)/admin/[activeCohort]/applications/action';
import ApplicationsFilters from './applications-filters';
import ApplicationsTableHeader from './applications-table-header';
import ApplicationsTableRow from './applications-table-row';
import ApplicationsPagination from './applications-pagination';
import ApplicationsMobile from './applications-mobile';
import BulkUpdateModal from './bulk-update-modal';
import ApplicantDetailsDialog from './applicant-details-dialog';
import { getApplicantName, getTrackName, getFeedbackMessage } from './applications-utils';
import { ApplicationsTableProps } from './applications-types';

export default function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [applicants, setApplicants] = useState<Applicant[]>(applications);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [viewApplicant, setViewApplicant] = useState<Applicant | null>(null);
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

  // Memoized derived data
  const tracks = useMemo(() => {
    return ['All', ...new Set(applicants.map(app => getTrackName(app)).filter(Boolean))];
  }, [applicants]);

  const statuses = useMemo(() => {
    return ['All', 'pending', 'shortlisted', 'rejected'];
  }, []);

  // Filtered and searched applicants
  const filteredApplicants = useMemo(() => {
    return applicants.filter(app => {
      const fullName = getApplicantName(app).toLowerCase();
      const email = app.applicant?.email.toLowerCase() || '';
      const appId = app._id.toLowerCase();

      const matchesSearch =
        fullName.includes(filters.search.toLowerCase()) ||
        email.includes(filters.search.toLowerCase()) ||
        appId.includes(filters.search.toLowerCase());

      const matchesTrack =
        filters.trackFilter === 'All' ? true : getTrackName(app) === filters.trackFilter;
      const matchesStatus =
        filters.statusFilter === 'All' ? true : app.status === filters.statusFilter;

      return matchesSearch && matchesTrack && matchesStatus;
    });
  }, [applicants, filters.search, filters.trackFilter, filters.statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredApplicants.length / filters.pageSize);
  const paginatedApplicants = filteredApplicants.slice(
    (filters.page - 1) * filters.pageSize,
    filters.page * filters.pageSize,
  );

  //  pagination info
  const startItem = (filters.page - 1) * filters.pageSize + 1;
  const endItem = Math.min(filters.page * filters.pageSize, filteredApplicants.length);

  const handleSelectApplicant = (id: string, checked: boolean) => {
    setSelectedApplicants(prev => (checked ? [...prev, id] : prev.filter(appId => appId !== id)));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedApplicants(paginatedApplicants.map(a => a._id));
    else setSelectedApplicants([]);
  };

  const handleBulkUpdate = async (action: 'shortlisted' | 'rejected') => {
    setIsBulkUpdating(true);
    const originalApplicants = [...applicants];

    setLoadingIds(prev => new Set([...prev, ...selectedApplicants]));

    setApplicants(prev =>
      prev.map(a => (selectedApplicants.includes(a._id) ? { ...a, status: action } : a)),
    );

    try {
      await Promise.all(
        selectedApplicants.map(id => reviewApplicationAction(id, action, 'Bulk update')),
      );

      setShowBulkModal(false);
      toast.success(
        `${selectedApplicants.length} applicant(s) ${action === 'shortlisted' ? 'shortlisted' : 'rejected'}!`,
      );
      setSelectedApplicants([]);
    } catch (error) {
      // Revert on error
      setApplicants(originalApplicants);
      toast.error('Failed to update some applicants');
    } finally {
      setIsBulkUpdating(false);
      // Clear loading state for bulk updated items
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        selectedApplicants.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: Applicant['status'],
    applicant: Applicant,
  ) => {
    if (newStatus === applicant.status) return;

    setLoadingIds(prev => new Set(prev).add(id));
    const originalApplicants = [...applicants];

    // Optimistic update
    setApplicants(prev => prev.map(app => (app._id === id ? { ...app, status: newStatus } : app)));

    try {
      const feedbackMessage = getFeedbackMessage(newStatus);
      await reviewApplicationAction(id, newStatus as 'shortlisted' | 'rejected', feedbackMessage);

      if (newStatus === 'shortlisted') {
        toast.success(`${getApplicantName(applicant)} shortlisted.`);
      } else if (newStatus === 'rejected') {
        toast.error(`${getApplicantName(applicant)} rejected.`);
      } else {
        toast.info(`${getApplicantName(applicant)} status updated to ${newStatus}.`);
      }
    } catch (error) {
      setApplicants(originalApplicants);
      toast.error(`Failed to update ${getApplicantName(applicant)} status`);
    } finally {
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
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
  const isApplicantLoading = (id: string) => loadingIds.has(id);

  return (
    <Box className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <Box>
          <h1 className="text-xl sm:text-2xl font-semibold text-indigo-700">Application Review</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage and review applicant submissions
          </p>
        </Box>
        {selectedApplicants.length > 0 && (
          <Button
            onClick={() => setShowBulkModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white ml-auto cursor-pointer"
            size="sm"
            disabled={isBulkUpdating}
          >
            {isBulkUpdating ? 'Updating...' : `Bulk Update (${selectedApplicants.length})`}
          </Button>
        )}
      </Box>

      {/* Filters */}
      <ApplicationsFilters
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
            <ApplicationsTableHeader
              selectedCount={selectedApplicants.length}
              totalCount={paginatedApplicants.length}
              onSelectAll={handleSelectAll}
            />
            <TableBody>
              {paginatedApplicants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No applicants found. {hasActiveFilters && 'Try adjusting your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedApplicants.map(applicant => (
                  <ApplicationsTableRow
                    key={applicant._id}
                    applicant={applicant}
                    isSelected={selectedApplicants.includes(applicant._id)}
                    isLoading={isApplicantLoading(applicant._id)}
                    onSelect={handleSelectApplicant}
                    onView={setViewApplicant}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* Mobile Table */}
      <ApplicationsMobile
        applicants={paginatedApplicants}
        selectedApplicants={selectedApplicants}
        onSelectApplicant={handleSelectApplicant}
        onViewApplicant={setViewApplicant}
        onUpdateApplicant={(id, status) => {
          const applicant = applicants.find(a => a._id === id);
          if (applicant) {
            handleStatusChange(id, status as Applicant['status'], applicant);
          }
        }}
        loadingIds={loadingIds}
      />

      {/* Pagination */}
      {filteredApplicants.length > 0 && (
        <ApplicationsPagination
          currentPage={filters.page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          totalItems={filteredApplicants.length}
          onPageChange={page => setFilters(prev => ({ ...prev, page }))}
        />
      )}

      {/* View Dialog */}
      <ApplicantDetailsDialog applicant={viewApplicant} onClose={() => setViewApplicant(null)} />

      {/* Bulk Update Modal */}
      <BulkUpdateModal
        open={showBulkModal}
        onOpenChange={setShowBulkModal}
        selectedCount={selectedApplicants.length}
        onBulkUpdate={handleBulkUpdate}
        isUpdating={isBulkUpdating}
      />
    </Box>
  );
}
