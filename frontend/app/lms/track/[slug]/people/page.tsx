"use client";

import { useParams } from "next/navigation";
import { trackService } from "@/services/trackService";
import { cohortService } from "@/services/cohortService";
import { useFetch } from "@/hooks/useFetch";
import Loader from "@/components/Loader";

export default function PeoplePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: track, isLoading } = useFetch(
    `track-${params.slug}`,
    () => cohortService.getTrackInActiveCohort(params.slug),
    [params.slug]
  );

  if (isLoading) return <Loader />;
  if (!track) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* Teachers */}
      <section>
        <div className="flex items-center justify-between border-b border-blue-600 pb-4 mb-4">
           <h2 className="text-3xl font-normal text-blue-600">Teachers</h2>
        </div>
        <div className="space-y-4">
           {track.mentors?.map((mentor: any) => (
              <div key={mentor._id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                 <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                    {mentor.firstName?.[0]}
                 </div>
                 <span className="font-medium text-gray-900">{mentor.firstName} {mentor.lastName}</span>
              </div>
           ))}
           {(!track.mentors || track.mentors.length === 0) && <p className="text-gray-500 italic">No teachers assigned</p>}
        </div>
      </section>

      {/* Classmates */}
      <section>
        <div className="flex items-center justify-between border-b border-blue-600 pb-4 mb-4">
           <h2 className="text-3xl font-normal text-blue-600">Classmates</h2>
           <span className="text-blue-600 font-medium">{track.students?.length || 0} students</span>
        </div>
        <div className="space-y-4">
           {track.students?.map((student: any) => (
              <div key={student._id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
                 <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-medium">
                    {student.firstName?.[0]}
                 </div>
                 <span className="font-medium text-gray-900">{student.firstName} {student.lastName}</span>
              </div>
           ))}
           {(!track.students || track.students.length === 0) && <p className="text-gray-500 italic">No students enrolled</p>}
        </div>
      </section>
    </div>
  );
}
