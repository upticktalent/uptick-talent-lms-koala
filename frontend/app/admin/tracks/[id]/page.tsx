"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Users, BookOpen, Calendar, Hash, CheckCircle, XCircle } from "lucide-react";
import { trackService } from "@/services/trackService";
import { formatDate } from "@/utils/formatDate";
import Loader from "@/components/Loader";

export default function TrackDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [track, setTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await trackService.getTrackById(id);
        setTrack(response.data);
      } catch (err) {
        setError("Failed to load track details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTrack();
    }
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-8 text-center">{error}</div>;
  if (!track) return <div className="p-8 text-center">Track not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link href="/admin/tracks" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Tracks
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{track.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-gray-500">
              <Hash className="w-4 h-4" />
              <span className="font-mono text-sm">{track.slug}</span>
            </div>
          </div>
          <Badge 
            variant={track.isActive ? "default" : "secondary"} 
            className={`px-3 py-1 text-sm ${track.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-800 hover:bg-gray-100"}`}
          >
            {track.isActive ? (
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active</span>
            ) : (
              <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Inactive</span>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About this Track</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {track.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Curriculum Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {track.curriculum && track.curriculum.length > 0 ? (
                <div className="space-y-4">
                  {track.curriculum.map((item: any, index: number) => (
                    <div key={item._id || index} className="flex items-start gap-3 p-3 rounded-lg border bg-slate-50">
                      <div className="bg-white p-2 rounded border shadow-sm">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-500">{item.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-slate-50 rounded-lg border border-dashed">
                  No curriculum items found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Students
                </span>
                <span className="font-semibold">{track.students?.length || 0}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Mentors
                </span>
                <span className="font-semibold">{track.mentors?.length || 0}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Created
                </span>
                <span className="text-sm font-medium">{formatDate(track.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              {track.mentors && track.mentors.length > 0 ? (
                <div className="space-y-3">
                  {track.mentors.map((mentor: any) => (
                    <div key={mentor._id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-xs">
                        {mentor.firstName?.[0]}{mentor.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{mentor.firstName} {mentor.lastName}</p>
                        <p className="text-xs text-gray-500">{mentor.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No mentors assigned.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
