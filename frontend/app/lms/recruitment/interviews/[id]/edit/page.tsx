/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { interviewService } from "@/services/interviewService";
import { RoleGuard } from "@/middleware/roleGuard";
import {
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import Loader from "@/components/Loader";

export default function EditInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    scheduledDate: "",
    scheduledTime: "",
    duration: 30,
    location: "",
    meetingLink: "",
    notes: "",
    interviewType: "",
  });

  useEffect(() => {
    fetchInterview();
  }, [interviewId]);

  const fetchInterview = async () => {
    try {
      setLoading(true);
      const response = await interviewService.getInterviewDetails(interviewId);

      if (response.data.success) {
        const interviewData = response.data.data;
        setInterview(interviewData);

        // Parse the scheduled date and time
        const scheduledDate = new Date(interviewData.scheduledDate);
        const dateStr = scheduledDate.toISOString().split("T")[0];
        const timeStr = scheduledDate.toTimeString().slice(0, 5);

        setFormData({
          scheduledDate: dateStr,
          scheduledTime: timeStr,
          duration: interviewData.duration || 30,
          location: interviewData.location || "",
          meetingLink: interviewData.meetingLink || "",
          notes: interviewData.notes || "",
          interviewType: interviewData.interviewType || "",
        });
      } else {
        setError("Failed to fetch interview details");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch interview details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.scheduledDate || !formData.scheduledTime) {
      setError("Date and time are required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Combine date and time
      const scheduledDateTime = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      const updateData = {
        scheduledDate: scheduledDateTime.toISOString(),
        duration: formData.duration,
        location: formData.location,
        meetingLink: formData.meetingLink,
        notes: formData.notes,
        interviewType: formData.interviewType,
      };

      const response = await interviewService.updateInterview(
        interviewId,
        updateData
      );

      if (response.data.success) {
        router.push("/lms/recruitment/interviews");
      } else {
        setError(response.data.message || "Failed to update interview");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update interview");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader text="Loading interview details..." />;
  }

  if (error && !interview) {
    return (
      <div className="text-center text-red-600">
        Failed to load interview: {error}
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin", "mentor"]}>
      <div className="space-y-6">
        {/* Header — responsive & minimal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 w-full">
            <Link href="/lms/recruitment/interviews" className="shrink-0">
              <Button variant="ghost" size="sm" className="px-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>

            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                Edit Interview
              </h1>
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                Update interview details for{" "}
                {interview?.application?.applicant?.firstName}{" "}
                {interview?.application?.applicant?.lastName}
              </p>
            </div>
          </div>
        </div>

        {/* Interview Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Information</CardTitle>
            <CardDescription>
              Track: {interview?.application?.track?.name} | Interviewer:{" "}
              {interview?.interviewer?.firstName}{" "}
              {interview?.interviewer?.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="scheduledDate"
                    className="flex items-center gap-2 mb-1"
                  >
                    <Calendar className="w-4 h-4" />
                    Interview Date
                  </Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      handleInputChange("scheduledDate", e.target.value)
                    }
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="scheduledTime"
                    className="flex items-center gap-2 mb-1"
                  >
                    <Clock className="w-4 h-4" />
                    Interview Time
                  </Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      handleInputChange("scheduledTime", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* Duration and Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration" className="mb-1">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="180"
                    step="15"
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", parseInt(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="interviewType" className="mb-1">
                    Interview Type
                  </Label>
                  <Select
                    value={formData.interviewType}
                    onValueChange={(value) =>
                      handleInputChange("interviewType", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="screening">Screening</SelectItem>
                      <SelectItem value="final">Final Round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location and Meeting Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="location"
                    className="flex items-center gap-2 mb-1"
                  >
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Online, Conference Room A, etc."
                  />
                </div>
                <div>
                  <Label
                    htmlFor="meetingLink"
                    className="flex items-center gap-2 mb-1"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Meeting Link
                  </Label>
                  <Input
                    id="meetingLink"
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) =>
                      handleInputChange("meetingLink", e.target.value)
                    }
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="mb-1">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes or instructions..."
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Interview
                    </>
                  )}
                </Button>
                <Link
                  href="/lms/recruitment/interviews"
                  className="w-full sm:w-auto"
                >
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={saving}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
