"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cohortService } from "@/services/cohortService";
import { taskService } from "@/services/taskService";
import { useFetch } from "@/hooks/useFetch";
import Loader from "@/components/Loader";
import { useUser } from "@/hooks/useUser";

export default function GradesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();
  const [tasks, setTasks] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [currentCohort, setCurrentCohort] = useState<any>(null);

  const { response: data, loading } = useFetch(
    () => cohortService.getTrackInActiveCohort(slug)
  );
const track = data?.track
  useEffect(() => {
    fetchCohortsAndTasks();
  }, [track]);

  const fetchCohortsAndTasks = async () => {
    if (!track) return;
    
    try {
      // Get current cohort
      const cohortResponse: any = await cohortService.getCurrentActiveCohort();
      if (cohortResponse.success) {
        setCurrentCohort(cohortResponse.data);
        
        // Get tasks for this cohort and track
        const tasksResponse: any = await taskService.getTasks(
          cohortResponse.data._id,
          track._id,
          1,
          100 // Get all tasks for grades view
        );
        
        if (tasksResponse.success) {
          const tasksWithSubmissions = tasksResponse.data.tasks || [];
          setTasks(tasksWithSubmissions);
          
          // Extract unique students from submissions
          const uniqueStudents = new Map();
          tasksWithSubmissions.forEach((task: any) => {
            task.submissions?.forEach((submission: any) => {
              const student = submission.student;
              if (student && !uniqueStudents.has(student._id)) {
                uniqueStudents.set(student._id, {
                  _id: student._id,
                  name: `${student.firstName} ${student.lastName}`,
                  firstName: student.firstName
                });
              }
            });
          });
          
          setStudents(Array.from(uniqueStudents.values()));
        }
      }
    } catch (error) {
      console.error('Error fetching grades data:', error);
    }
  };

  const getStudentGrade = (studentId: string, taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return null;
    
    const submission = task.submissions?.find((sub: any) => 
      (typeof sub.student === 'string' ? sub.student : sub.student._id) === studentId
    );
    
    return submission?.grade || null;
  };

  const calculateAverage = (studentId: string) => {
    const grades = tasks.map(task => getStudentGrade(studentId, task._id))
                       .filter(grade => grade !== null && grade !== undefined);
    
    if (grades.length === 0) return 0;
    return Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length);
  };

  if (loading) return <Loader />;
  if (!track) return null;

  return (
    <div className="max-w-full p-6 overflow-x-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{track.name} - Grades</h1>
        <p className="text-muted-foreground">{currentCohort?.name}</p>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">No graded tasks yet</h3>
          <p className="text-sm text-muted-foreground">Tasks with submissions and grades will appear here</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[200px] font-semibold">Student</TableHead>
                {tasks.map(task => (
                  <TableHead key={task._id} className="text-center font-semibold min-w-[120px]">
                    <div className="space-y-1">
                      <div className="truncate">{task.title}</div>
                      <Badge variant="outline" className="text-xs">
                        {task.maxScore} pts
                      </Badge>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold text-blue-600">Average</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tasks.length + 2} className="text-center py-8 text-muted-foreground">
                    No student submissions found
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student._id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                          {student.firstName?.charAt(0) || 'S'}
                        </div>
                        {student.name}
                      </div>
                    </TableCell>
                    {tasks.map((task) => {
                      const grade = getStudentGrade(student._id, task._id);
                      return (
                        <TableCell key={task._id} className="text-center">
                          {grade !== null ? (
                            <span className={`font-medium ${
                              grade >= 90 ? 'text-green-600' :
                              grade >= 80 ? 'text-blue-600' :
                              grade >= 70 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {grade}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-bold text-blue-600">
                      {calculateAverage(student._id)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
