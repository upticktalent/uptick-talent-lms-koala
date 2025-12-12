import { useCohortContext } from "@/contexts/CohortContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  BookOpen,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

/**
 * Cohort Status Component
 * Displays the current active cohort information and provides refresh functionality
 */
export default function CohortStatus() {
  const { currentCohort, loading, error, refreshCohort } = useCohortContext();

  if (loading) {
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin">
              <RefreshCw className="h-4 w-4" />
            </div>
            <span className="text-sm">Loading cohort information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={refreshCohort}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentCohort) {
    return (
      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                No active cohort found
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={refreshCohort}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Active Cohort
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={refreshCohort}>
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-green-900">
              {currentCohort.name}
            </h3>
            <p className="text-sm text-green-700">
              {currentCohort.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-green-600" />
              <span className="text-green-700">
                {new Date(currentCohort.startDate).toLocaleDateString()} -{" "}
                {new Date(currentCohort.endDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-green-600" />
              <span className="text-green-700">
                {currentCohort.currentStudents || 0} /{" "}
                {currentCohort.maxStudents} students
              </span>
            </div>

            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-green-600" />
              <span className="text-green-700">
                {currentCohort.tracks?.length || 0} tracks
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                currentCohort.status === "active" ? "default" : "secondary"
              }
            >
              {currentCohort.status}
            </Badge>
            {currentCohort.isCurrentlyActive && (
              <Badge
                variant="outline"
                className="border-green-600 text-green-700"
              >
                Currently Active
              </Badge>
            )}
          </div>

          {currentCohort.tracks && currentCohort.tracks.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-green-800 mb-1">
                Tracks in this cohort:
              </p>
              <div className="flex flex-wrap gap-1">
                {currentCohort.tracks.map((cohortTrack: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {cohortTrack.track?.name || "Unknown Track"}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
