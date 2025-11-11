/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Box from '@/components/ui/box';
import { Interview } from './interviews-types';
import InterviewsFilters from './interviews-filters';
import InterviewsTableHeader from './interviews-table-header';
import InterviewsTableRow from './interviews-table-row';
import InterviewsPagination from './interviews-pagination';
import InterviewsMobile from './interviews-mobile';
import BulkInterviewModal from './bulk-update';
import InterviewDetailsDialog from './interview-details-dialog';

import { InterviewsTableProps } from './interviews-types';
import { getTrackName } from './interviews-utils';

export default function InterviewsTable({ interviews: initialInterviews }: InterviewsTableProps) {
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews);
  const [selectedInterviews, setSelectedInterviews] = useState<string[]>([]);
  const [viewInterview, setViewInterview] = useState<Interview | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    trackFilter: 'All',
    statusFilter: 'All',
    page: 1,
    pageSize: 10,
  });
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const tracks = useMemo(() => {
    return ['All', ...new Set(interviews.map(inter => getTrackName(inter)).filter(Boolean))];
  }, [interviews]);

  // Filtered and searched interviews
  const filteredInterviews = useMemo(() => {
    return interviews.filter(interview => {
      const applicantName = interview.applicant.name.toLowerCase();
      const track = interview.track.toLowerCase();
      const interviewerName = interview.interviewer.name.toLowerCase();

      const matchesSearch =
        applicantName.includes(filters.search.toLowerCase()) ||
        track.includes(filters.search.toLowerCase()) ||
        interviewerName.includes(filters.search.toLowerCase());

      const matchesTrack =
        filters.trackFilter === 'All' ? true : interview.track === filters.trackFilter;
      const matchesStatus =
        filters.statusFilter === 'All' ? true : interview.status === filters.statusFilter;

      return matchesSearch && matchesTrack && matchesStatus;
    });
  }, [interviews, filters.search, filters.trackFilter, filters.statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredInterviews.length / filters.pageSize);
  const paginatedInterviews = filteredInterviews.slice(
    (filters.page - 1) * filters.pageSize,
    filters.page * filters.pageSize,
  );

  // Calculate visible range for pagination info
  const startItem = (filters.page - 1) * filters.pageSize + 1;
  const endItem = Math.min(filters.page * filters.pageSize, filteredInterviews.length);

  const handleSelectInterview = (id: string, checked: boolean) => {
    setSelectedInterviews(prev =>
      checked ? [...prev, id] : prev.filter(interviewId => interviewId !== id),
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedInterviews(paginatedInterviews.map(i => i.id));
    else setSelectedInterviews([]);
  };

  const handleBulkUpdate = async (action: 'completed' | 'cancelled' | 'rescheduled') => {
    const originalInterviews = [...interviews];

    // Optimistic update
    setInterviews(prev =>
      prev.map(interview =>
        selectedInterviews.includes(interview.id)
          ? { ...interview, status: action === 'rescheduled' ? 'scheduled' : action }
          : interview,
      ),
    );

    try {
      // Call your bulk update API here
      // await bulkUpdateInterviews(selectedInterviews, action);

      setShowBulkModal(false);
      toast.success(`${selectedInterviews.length} interview(s) updated!`);
      setSelectedInterviews([]);
    } catch (error) {
      // Revert on error
      setInterviews(originalInterviews);
      toast.error('Failed to update some interviews');
    }
  };

  const handleStatusChange = async (id: string, newStatus: Interview['status']) => {
    setLoadingIds(prev => new Set(prev).add(id));
    const originalInterviews = [...interviews];

    // Optimistic update
    setInterviews(prev =>
      prev.map(interview =>
        interview.id === id ? { ...interview, status: newStatus } : interview,
      ),
    );

    try {
      // Call your API here
      // await updateInterviewStatus(id, newStatus);

      toast.success(`Interview status updated to ${newStatus}`);
    } catch (error) {
      // Revert on error
      setInterviews(originalInterviews);
      toast.error('Failed to update interview status');
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
  const isInterviewLoading = (id: string) => loadingIds.has(id);

  return (
    <Box className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <Box className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <Box>
          <h1 className="text-xl sm:text-2xl font-semibold text-indigo-700">Interviews</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage and track all interview sessions
          </p>
        </Box>
        <Box className="flex gap-2">
          {selectedInterviews.length > 0 && (
            <Button
              onClick={() => setShowBulkModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              size="sm"
            >
              Bulk Update ({selectedInterviews.length})
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <InterviewsFilters
        search={filters.search}
        trackFilter={filters.trackFilter}
        statusFilter={filters.statusFilter}
        pageSize={filters.pageSize}
        tracks={tracks}
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
            <InterviewsTableHeader
              selectedCount={selectedInterviews.length}
              totalCount={paginatedInterviews.length}
              onSelectAll={handleSelectAll}
            />
            <TableBody>
              {paginatedInterviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No interviews found. {hasActiveFilters && 'Try adjusting your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInterviews.map(interview => (
                  <InterviewsTableRow
                    key={interview.id}
                    interview={interview}
                    isSelected={selectedInterviews.includes(interview.id)}
                    isLoading={isInterviewLoading(interview.id)}
                    onSelect={handleSelectInterview}
                    onView={setViewInterview}
                    onStatusChange={handleStatusChange}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* Mobile Table */}
      <InterviewsMobile
        interviews={paginatedInterviews}
        onViewInterview={interview => setViewInterview(interview as Interview)}
        onUpdateInterview={handleStatusChange}
        loadingIds={loadingIds}
      />

      {/* Pagination */}
      {filteredInterviews.length > 0 && (
        <InterviewsPagination
          currentPage={filters.page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          totalItems={filteredInterviews.length}
          onPageChange={page => setFilters(prev => ({ ...prev, page }))}
        />
      )}

      {/* View Dialog */}
      <InterviewDetailsDialog interview={viewInterview} onClose={() => setViewInterview(null)} />

      {/* Bulk Update Modal */}
      <BulkInterviewModal
        open={showBulkModal}
        onOpenChange={setShowBulkModal}
        selectedCount={selectedInterviews.length}
        onBulkUpdate={handleBulkUpdate}
      />
    </Box>
  );
}
