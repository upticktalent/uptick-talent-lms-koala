/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Eye, ChevronLeft, ChevronRight, X, Loader } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

import ApplicantDetails from './application-details';
import { Applicant } from '@/types/assessments-admin';
import ApplicationsMobile from './applications-mobile';
import BulkUpdateModal from './bulk-update-modal';
import { reviewApplicationAction } from '@/app/(dashboard)/admin/[activeCohort]/applications/action';
import Box from '@/components/ui/box';

const getApplicantName = (app: Applicant) => {
  if (!app.applicant) return 'Unknown Applicant';
  return (
    `${app.applicant.firstName || ''} ${app.applicant.lastName || ''}`.trim() || 'Unknown Applicant'
  );
};

const getApplicantEmail = (app: Applicant) => {
  return app.applicant?.email || 'No email';
};

const getTrackName = (app: Applicant) => {
  return app.track?.name || 'Unknown Track';
};

const getCohortName = (app: Applicant) => {
  return app.cohort?.name || 'Unknown Cohort';
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'rejected':
      return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
    case 'shortlisted':
      return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Shortlisted</Badge>;
    default:
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'No date';

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Invalid Date'
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
  } catch {
    return 'Invalid Date';
  }
};

interface ApplicationsTableProps {
  applications: Applicant[];
}

export default function ApplicationsTable({ applications }: ApplicationsTableProps) {
  const [isPending, startTransition] = useTransition();
  const [applicants, setApplicants] = useState<Applicant[]>(applications);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [viewApplicant, setViewApplicant] = useState<Applicant | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

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
      const email = getApplicantEmail(app).toLowerCase();
      const appId = app._id.toLowerCase();

      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase()) ||
        appId.includes(search.toLowerCase());

      const matchesTrack = trackFilter === 'All' ? true : getTrackName(app) === trackFilter;
      const matchesStatus = statusFilter === 'All' ? true : app.status === statusFilter;

      return matchesSearch && matchesTrack && matchesStatus;
    });
  }, [applicants, search, trackFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredApplicants.length / pageSize);
  const paginatedApplicants = filteredApplicants.slice((page - 1) * pageSize, page * pageSize);

  // Calculate visible range for pagination info
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, filteredApplicants.length);

  const handleSelectApplicant = (id: string, checked: boolean) => {
    setSelectedApplicants(prev => (checked ? [...prev, id] : prev.filter(appId => appId !== id)));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedApplicants(paginatedApplicants.map(a => a._id));
    else setSelectedApplicants([]);
  };

  const handleBulkUpdate = async (action: 'shortlisted' | 'rejected') => {
    const originalApplicants = [...applicants];

    setApplicants(prev =>
      prev.map(a => (selectedApplicants.includes(a._id) ? { ...a, status: action } : a)),
    );

    try {
      // Call bulk update API
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
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: Applicant['status'],
    applicant: Applicant,
  ) => {
    if (newStatus === applicant.status) return; // No change needed

    setLoadingIds(prev => new Set(prev).add(id));
    const originalApplicants = [...applicants];

    // Optimistic update
    setApplicants(prev => prev.map(app => (app._id === id ? { ...app, status: newStatus } : app)));

    try {
      let feedbackMessage = '';
      switch (newStatus) {
        case 'shortlisted':
          feedbackMessage = 'Good candidate';
          break;
        case 'rejected':
          feedbackMessage = 'Does not meet the minimum requirements for this track.';
          break;
        default:
          feedbackMessage = 'Status updated';
      }

      await reviewApplicationAction(id, newStatus as 'shortlisted' | 'rejected', feedbackMessage);

      if (newStatus === 'shortlisted') {
        toast.success(`${getApplicantName(applicant)} shortlisted.`);
      } else if (newStatus === 'rejected') {
        toast.error(`${getApplicantName(applicant)} rejected.`);
      } else {
        toast.info(`${getApplicantName(applicant)} status updated to ${newStatus}.`);
      }
    } catch (error) {
      // Revert on error
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

  const clearFilters = () => {
    setSearch('');
    setTrackFilter('All');
    setStatusFilter('All');
    setPage(1);
  };

  const hasActiveFilters = search || trackFilter !== 'All' || statusFilter !== 'All';

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
          >
            Bulk Update ({selectedApplicants.length})
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Box className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-64 border-indigo-200 text-black focus-visible:ring-indigo-600"
        />

        <Select
          value={trackFilter}
          onValueChange={value => {
            setTrackFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px] border-indigo-200 text-black focus:ring-indigo-600">
            <SelectValue placeholder="All Tracks" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-indigo-100 text-black">
            {tracks.map(track => (
              <SelectItem key={track} value={track}>
                {track}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={value => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px] text-black border-indigo-200 focus:ring-indigo-600">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-indigo-100 text-black">
            {statuses.map(status => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={pageSize.toString()}
          onValueChange={value => {
            setPageSize(Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[120px] border-indigo-200 text-black focus:ring-indigo-600">
            <SelectValue placeholder="Page size" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-indigo-100 text-black">
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            className="bg-transparent border border-indigo-200 hover:bg-transparent text-indigo-600 w-full sm:w-auto cursor-pointer"
            size="sm"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </Box>

      {/* Desktop Table */}
      <Box className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Box className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-indigo-600">
                <TableHead className="w-12 text-white">
                  <Checkbox
                    checked={
                      paginatedApplicants.length > 0 &&
                      paginatedApplicants.every(a => selectedApplicants.includes(a._id))
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all visible applicants"
                  />
                </TableHead>
                <TableHead className="text-white">Applicant</TableHead>
                <TableHead className="text-white">Track</TableHead>
                <TableHead className="text-white">Cohort</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Date Applied</TableHead>
                <TableHead className="text-right text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedApplicants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No applicants found. {hasActiveFilters && 'Try adjusting your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedApplicants.map(applicant => (
                  <TableRow key={applicant._id} className="hover:bg-indigo-50/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedApplicants.includes(applicant._id)}
                        onCheckedChange={checked =>
                          handleSelectApplicant(applicant._id, checked as boolean)
                        }
                        aria-label={`Select ${getApplicantName(applicant)}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box className="font-medium text-gray-900 capitalize">
                          {getApplicantName(applicant)}
                        </Box>
                        <Box className="text-xs text-gray-500">{getApplicantEmail(applicant)}</Box>
                      </Box>
                    </TableCell>
                    <TableCell className="text-gray-700">{getTrackName(applicant)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal text-gray-900">
                        {getCohortName(applicant)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(applicant.submittedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Box className="flex gap-2 justify-end flex-wrap items-center">
                        {/* Updated View Button with better styling */}
                        <Button
                          size="sm"
                          onClick={() => setViewApplicant(applicant)}
                          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer transition-colors duration-200"
                          aria-label={`View details for ${getApplicantName(applicant)}`}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-medium">View</span>
                        </Button>

                        <Select
                          value={applicant.status}
                          onValueChange={(value: 'pending' | 'shortlisted' | 'rejected') =>
                            handleStatusChange(applicant._id, value, applicant)
                          }
                          disabled={isApplicantLoading(applicant._id)}
                        >
                          <SelectTrigger className="w-[140px] border-indigo-200 text-black focus:ring-indigo-600 disabled:opacity-50">
                            {isApplicantLoading(applicant._id) ? (
                              <Box className="flex items-center gap-2">
                                <Loader className="w-3 h-3 animate-spin" />
                                <span className="text-sm">Updating...</span>
                              </Box>
                            ) : (
                              <SelectValue placeholder="Update status" />
                            )}
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-indigo-100 text-black">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="shortlisted">Shortlist</SelectItem>
                            <SelectItem value="rejected">Reject</SelectItem>
                          </SelectContent>
                        </Select>
                      </Box>
                    </TableCell>
                  </TableRow>
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
        <Box className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <Box className="flex gap-2">
            <Button
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="text-indigo-600 border border-indigo-600 cursor-pointer disabled:cursor-not-allowed bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <Button
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="text-indigo-600 border border-indigo-600 cursor-pointer disabled:cursor-not-allowed bg-transparent"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Box>

          <Box className="flex flex-col sm:flex-row items-center gap-2 text-sm text-gray-600">
            <p>
              Showing {startItem}-{endItem} of {filteredApplicants.length} applicants
            </p>
            <span className="hidden sm:inline">•</span>
            <p>
              Page {page} of {totalPages}
            </p>
          </Box>
        </Box>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewApplicant} onOpenChange={() => setViewApplicant(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-indigo-100">
          <DialogHeader>
            <DialogTitle className="text-indigo-700">Applicant Details</DialogTitle>
          </DialogHeader>
          {viewApplicant && (
            <ApplicantDetails applicant={viewApplicant} onClose={() => setViewApplicant(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Update Modal */}
      <BulkUpdateModal
        open={showBulkModal}
        onOpenChange={setShowBulkModal}
        selectedCount={selectedApplicants.length}
        onBulkUpdate={handleBulkUpdate}
      />
    </Box>
  );
}
