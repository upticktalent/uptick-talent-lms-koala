/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useMemo } from 'react';
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
import { Eye, ChevronLeft, ChevronRight, X, Download, ClipboardList } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { toast } from 'sonner';
import AssessmentDetails from './assessment-details';
import BulkUpdateModal from './bulk-update';
import AssessmentMobile from './assessment-mobile';
import { Assessment } from '@/types/assessments-admin';
import { getFullName } from '@/utils/helper';
import Box from '@/components/ui/box';

// Helper functions
const getApplicantName = (assessment: Assessment) => {
  return (
    getFullName(
      assessment.application.applicant?.firstName,
      assessment.application.applicant?.lastName,
    ) || 'Unknown Applicant'
  );
};

const getApplicantEmail = (assessment: Assessment) => {
  return assessment.application.applicant?.email || 'No email';
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'rejected':
      return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
    case 'under-review':
      return (
        <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Under Review</Badge>
      );
    case 'submitted':
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Submitted</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface AssessmentReviewClientProps {
  assessments: Assessment[];
}

export default function AssessmentTable({
  assessments: initialAssessments,
}: AssessmentReviewClientProps) {
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [viewAssessment, setViewAssessment] = useState<Assessment | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filtered and searched assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const applicantName = getApplicantName(assessment);
      const email = getApplicantEmail(assessment);
      const track = assessment.application.track.name;

      const matchesSearch =
        applicantName.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());
      const matchesTrack = trackFilter === 'All' ? true : track === trackFilter;
      const matchesStatus = statusFilter === 'All' ? true : assessment.status === statusFilter;
      return matchesSearch && matchesTrack && matchesStatus;
    });
  }, [assessments, search, trackFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAssessments.length / pageSize);
  const paginatedAssessments = filteredAssessments.slice((page - 1) * pageSize, page * pageSize);

  const handleSelectAssessment = (id: string, checked: boolean) => {
    setSelectedAssessments(prev =>
      checked ? [...prev, id] : prev.filter(assessmentId => assessmentId !== id),
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedAssessments(paginatedAssessments.map(a => a._id));
    else setSelectedAssessments([]);
  };

  const handleBulkUpdate = (action: 'under-review' | 'rejected') => {
    setAssessments(prev =>
      prev.map(a => (selectedAssessments.includes(a._id) ? { ...a, status: action } : a)),
    );
    setShowBulkModal(false);
    toast.success(
      `${selectedAssessments.length} assessment(s) ${action === 'under-review' ? 'marked for review' : 'rejected'}!`,
    );
    setSelectedAssessments([]);
  };

  const handleStatusChange = async (
    id: string,
    newStatus: 'under-review' | 'rejected',
    assessment: Assessment,
  ) => {
    if (newStatus === assessment.status) return; // No change needed

    setAssessments(prev => prev.map(a => (a._id === id ? { ...a, status: newStatus } : a)));

    try {
      if (newStatus === 'under-review') {
        toast.success(`${getApplicantName(assessment)}'s assessment marked as under review`);
      } else if (newStatus === 'rejected') {
        toast.error(`${getApplicantName(assessment)}'s assessment has been rejected`);
      }
    } catch (error) {
      // Revert on error
      setAssessments(prev =>
        prev.map(a => (a._id === id ? { ...a, status: assessment.status } : a)),
      );
      toast.error(`Failed to update ${getApplicantName(assessment)}'s status`);
    }
  };

  const handleUnderReview = (id: string, name: string) => {
    setAssessments(
      assessments.map(assessment =>
        assessment._id === id ? { ...assessment, status: 'under-review' as const } : assessment,
      ),
    );
    toast.success(`${name}'s assessment marked as under review`);
    setViewAssessment(null);
  };

  const handleReject = (id: string, name: string) => {
    setAssessments(
      assessments.map(assessment =>
        assessment._id === id ? { ...assessment, status: 'rejected' as const } : assessment,
      ),
    );
    toast.error(`${name}'s assessment has been rejected`);
    setViewAssessment(null);
  };

  const handleDownload = (url: string, name: string) => {
    toast.success(`Downloading ${name}'s assessment...`);
    window.open(url, '_blank');
  };

  const clearFilters = () => {
    setSearch('');
    setTrackFilter('All');
    setStatusFilter('All');
    setPage(1);
  };

  const hasActiveFilters = search || trackFilter !== 'All' || statusFilter !== 'All';

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
          >
            Bulk Update ({selectedAssessments.length})
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Box className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by applicant name..."
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
            <SelectItem value="All">All Tracks</SelectItem>
            <SelectItem value="Product Management">Product Management</SelectItem>
            <SelectItem value="Backend">Backend</SelectItem>
            <SelectItem value="Frontend">Frontend</SelectItem>
            <SelectItem value="Data Science">Data Science</SelectItem>
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
            <SelectItem value="All">All Statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under-review">Under Review</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
                      paginatedAssessments.length > 0 &&
                      paginatedAssessments.every(a => selectedAssessments.includes(a._id))
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all visible assessments"
                  />
                </TableHead>
                <TableHead className="text-white">Applicant</TableHead>
                <TableHead className="text-white">Track</TableHead>
                <TableHead className="text-white">Cohort</TableHead>
                <TableHead className="text-white">Submitted</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-right text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedAssessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No assessments found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAssessments.map(assessment => (
                  <TableRow key={assessment._id} className="hover:bg-indigo-50/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedAssessments.includes(assessment._id)}
                        onCheckedChange={checked =>
                          handleSelectAssessment(assessment._id, checked as boolean)
                        }
                        aria-label={`Select ${getApplicantName(assessment)}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box className="font-medium text-gray-900">
                          {getApplicantName(assessment)}
                        </Box>
                        <Box className="text-xs text-gray-500">{getApplicantEmail(assessment)}</Box>
                      </Box>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {assessment.application.track.name}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {assessment.application.cohort.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(assessment.submittedAt)}
                    </TableCell>
                    <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                    <TableCell className="text-right">
                      <Box className="flex gap-2 justify-end flex-wrap items-center">
                        {/* View Button */}
                        <Button
                          size="sm"
                          onClick={() => setViewAssessment(assessment)}
                          className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer transition-colors duration-200"
                          aria-label={`View details for ${getApplicantName(assessment)}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Download Button */}
                        <Button
                          size="sm"
                          onClick={() =>
                            handleDownload(assessment.fileUrl, getApplicantName(assessment))
                          }
                          className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 cursor-pointer transition-colors duration-200"
                        >
                          <Download className="w-4 h-4" />
                        </Button>

                        {/* Status Update Select */}
                        <Select
                          value=""
                          onValueChange={(value: 'under-review' | 'rejected') =>
                            handleStatusChange(assessment._id, value, assessment)
                          }
                        >
                          <SelectTrigger className="w-[140px] border-indigo-200 text-black focus:ring-indigo-600">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border border-indigo-100 text-black">
                            <SelectItem value="under-review">Review</SelectItem>
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
      <AssessmentMobile
        assessments={paginatedAssessments}
        selectedAssessments={selectedAssessments}
        onSelectAssessment={handleSelectAssessment}
        onViewAssessment={setViewAssessment}
        onDownloadAssessment={assessment =>
          handleDownload(assessment.fileUrl, getApplicantName(assessment))
        }
        onStatusChange={(id, status, assessment) => handleStatusChange(id, status, assessment)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
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

          <p className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </p>
        </Box>
      )}

      {/* View Assessment Dialog */}
      <Dialog open={!!viewAssessment} onOpenChange={() => setViewAssessment(null)}>
        <DialogContent className="max-w-6xl w-full bg-white border border-indigo-100 max-h-[90vh] rounded-lg shadow-lg flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-indigo-700 text-xl text-center font-semibold">
              Assessment Details
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-center text-sm mt-1">
              Review the submitted assessment and take action
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable content area */}
          <Box className="overflow-y-auto flex-1 space-y-4 element">
            {viewAssessment && <AssessmentDetails assessment={viewAssessment} />}
          </Box>

          {/* Footer with buttons, now static */}
          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-3 px-6 py-4 border-t bg-white">
            {/* Download Button */}
            <Button
              onClick={() =>
                handleDownload(viewAssessment?.fileUrl || '', getApplicantName(viewAssessment!))
              }
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 cursor-pointer transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            {/* Action Buttons */}
            <Box className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() =>
                  handleReject(viewAssessment?._id || '', getApplicantName(viewAssessment!))
                }
                disabled={viewAssessment?.status === 'rejected'}
                className="flex-1 sm:flex-none w-full sm:w-auto bg-red-500 text-white border border-red-500 hover:bg-red-600 transition-colors duration-150 cursor-pointer"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() =>
                  handleUnderReview(viewAssessment?._id || '', getApplicantName(viewAssessment!))
                }
                disabled={viewAssessment?.status === 'under-review'}
                className="flex-1 sm:flex-none w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-150 cursor-pointer"
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Mark for Review
              </Button>
            </Box>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Update Modal */}
      <BulkUpdateModal
        open={showBulkModal}
        onOpenChange={setShowBulkModal}
        selectedCount={selectedAssessments.length}
        onBulkUpdate={handleBulkUpdate}
      />
    </Box>
  );
}
