"use client";

import { useState } from "react";
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
import { interviewService } from "@/services/interviewService";
import { Calendar, Clock, User, CheckCircle, ArrowLeft } from "lucide-react";
import { formatDate, formatTime } from "@/utils/formatDate";
import Link from "next/link";

export default function PublicInterviewSchedulePage() {
  const [step, setStep] = useState<"verify" | "schedule" | "success">("verify");
  const [applicationId, setApplicationId] = useState("");
  const [application, setApplication] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduledInterview, setScheduledInterview] = useState<any>(null);

  const verifyApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicationId.trim()) {
      setError("Please enter your application ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if interview already exists for this application
      try {
        const existingResponse =
          await interviewService.getInterviewByApplication(applicationId);
        if (existingResponse.data.success && existingResponse.data.data) {
          setError(
            "You already have an interview scheduled for this application."
          );
          return;
        }
      } catch (err: any) {
        // If 404, it means no interview exists yet, which is what we want
        if (err.response?.status !== 404) {
          throw err;
        }
      }

      // Fetch available slots for this application's track
      const slotsResponse = await interviewService.getAvailableSlots({
        applicationId: applicationId,
      });

      if (slotsResponse.data.success) {
        const slotsData = slotsResponse.data.data?.slotsByDate || {};
        if (Object.keys(slotsData).length === 0) {
          setError(
            "No available interview slots found for your program track at this time."
          );
          return;
        }
        setAvailableSlots(slotsData);
        setApplication({ id: applicationId });
        setStep("schedule");
      } else {
        setError("No available interview slots found.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to verify application. Please check your application ID."
      );
    } finally {
      setLoading(false);
    }
  };

  const scheduleInterview = async () => {
    if (!selectedSlot) {
      setError("Please select an interview slot");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await interviewService.scheduleInterview({
        applicationId: applicationId,
        slotId: selectedSlot,
      });

      if (response.data.success) {
        setScheduledInterview(response.data.data);
        setStep("success");
      } else {
        setError(response.data.message || "Failed to schedule interview");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to schedule interview. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderVerificationStep = () => (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Schedule Your Interview
        </h1>
        <p className="text-gray-600">
          Enter your application ID to begin scheduling your interview
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={verifyApplication} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="applicationId" className="text-sm font-medium">
                Application ID
              </Label>
              <Input
                id="applicationId"
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Enter your application ID"
                className="w-full"
                required
              />
              <p className="text-sm text-gray-500">
                You should have received this ID via email when you submitted
                your application.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Continue to Schedule"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const renderScheduleStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Select Interview Slot
        </h1>
        <p className="text-gray-600">
          Choose a convenient time for your interview
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Application ID: {applicationId}
        </p>
      </div>

      {Object.keys(availableSlots).length === 0 ? (
        <Card>
          <CardContent className="pt-8 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Available Slots
            </h3>
            <p className="text-gray-500 mb-6">
              No interview slots are currently available. Please check back
              later or contact support.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setStep("verify");
                setError(null);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(availableSlots).map(
            ([date, slots]: [string, any]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    {formatDate(date)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {slots.map((slot: any) => (
                      <button
                        key={slot._id}
                        onClick={() => setSelectedSlot(slot._id)}
                        className={`p-6 border-2 rounded-xl text-left transition-all hover:shadow-md ${
                          selectedSlot === slot._id
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-lg">
                            {formatTime(slot.startTime)} -{" "}
                            {formatTime(slot.endTime)}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>
                              Interviewer: {slot.interviewer?.firstName}{" "}
                              {slot.interviewer?.lastName}
                            </span>
                          </div>
                          <p>Duration: {slot.duration} minutes</p>
                          <p>Location: {slot.location}</p>
                          {slot.availableSpots && (
                            <p className="text-green-600 font-medium">
                              {slot.availableSpots} slot
                              {slot.availableSpots !== 1 ? "s" : ""} available
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4 justify-center pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setStep("verify");
                setError(null);
                setSelectedSlot("");
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={scheduleInterview}
              disabled={!selectedSlot || loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Scheduling...
                </>
              ) : (
                "Schedule Interview"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSuccessStep = () => (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Interview Scheduled!
        </h1>
        <p className="text-gray-600">
          Your interview has been successfully scheduled
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {scheduledInterview && (
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">
                Interview Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">
                    {new Date(
                      scheduledInterview.scheduledDate
                    ).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span>
                    {new Date(
                      scheduledInterview.scheduledDate
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    ({scheduledInterview.duration} minutes)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <span>
                    Interviewer: {scheduledInterview.interviewer?.firstName}{" "}
                    {scheduledInterview.interviewer?.lastName}
                  </span>
                </div>
                {scheduledInterview.location && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      📍
                    </div>
                    <span>{scheduledInterview.location}</span>
                  </div>
                )}
                {scheduledInterview.meetingLink && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      🔗
                    </div>
                    <a
                      href={scheduledInterview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Join Meeting
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-green-50 p-6 rounded-xl">
            <h4 className="font-medium text-green-800 mb-3">What's Next?</h4>
            <div className="space-y-2 text-sm text-green-700">
              <p>✅ Confirmation email sent to your registered email address</p>
              <p>✅ Calendar invite included with meeting details</p>
              <p>✅ You can reschedule if needed by contacting support</p>
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="secondary"
              onClick={() => {
                setStep("verify");
                setApplicationId("");
                setSelectedSlot("");
                setScheduledInterview(null);
                setError(null);
              }}
            >
              Schedule Another Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        {step === "verify" && renderVerificationStep()}
        {step === "schedule" && renderScheduleStep()}
        {step === "success" && renderSuccessStep()}
      </div>
    </div>
  );
}
