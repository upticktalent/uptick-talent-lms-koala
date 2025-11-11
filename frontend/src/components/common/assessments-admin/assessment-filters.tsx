'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import Box from '@/components/ui/box';

interface AssessmentFiltersProps {
  search: string;
  trackFilter: string;
  statusFilter: string;
  pageSize: number;
  tracks: string[];
  statuses: string[];
  hasActiveFilters: boolean | string;
  onSearchChange: (value: string) => void;
  onTrackFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onPageSizeChange: (value: number) => void;
  onClearFilters: () => void;
}

export default function AssessmentFilters({
  search,
  trackFilter,
  statusFilter,
  pageSize,
  tracks,
  statuses,
  hasActiveFilters,
  onSearchChange,
  onTrackFilterChange,
  onStatusFilterChange,
  onPageSizeChange,
  onClearFilters,
}: AssessmentFiltersProps) {
  return (
    <Box className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Search by name, email, or ID..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full sm:w-64 border-indigo-200 text-black focus-visible:ring-indigo-600"
      />

      <Select value={trackFilter} onValueChange={onTrackFilterChange}>
        <SelectTrigger className="w-full sm:w-[200px] border-indigo-200 text-black focus:ring-indigo-600">
          <SelectValue placeholder="All Tracks" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-indigo-100 text-black">
          {tracks.map(track => (
            <SelectItem className="focus:bg-indigo-600" key={track} value={track}>
              {track}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px] text-black border-indigo-200 focus:ring-indigo-600">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-indigo-100 text-black">
          {statuses.map(status => (
            <SelectItem className="focus:bg-indigo-600" key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={pageSize.toString()} onValueChange={value => onPageSizeChange(Number(value))}>
        <SelectTrigger className="w-full sm:w-[120px] border-indigo-200 text-black focus:ring-indigo-600">
          <SelectValue placeholder="Page size" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-indigo-100 text-black">
          <SelectItem className="focus:bg-indigo-600" value="5">
            5 per page
          </SelectItem>
          <SelectItem className="focus:bg-indigo-600" value="10">
            10 per page
          </SelectItem>
          <SelectItem className="focus:bg-indigo-600" value="25">
            25 per page
          </SelectItem>
          <SelectItem className="focus:bg-indigo-600" value="50">
            50 per page
          </SelectItem>
          <SelectItem className="focus:bg-indigo-600" value="100">
            100 per page
          </SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          onClick={onClearFilters}
          className="bg-transparent border border-indigo-200 hover:bg-transparent text-indigo-600 w-full sm:w-auto cursor-pointer"
          size="sm"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </Box>
  );
}
