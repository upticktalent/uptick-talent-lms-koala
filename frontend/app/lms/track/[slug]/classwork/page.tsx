"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, BookOpen, MoreVertical, Link as LinkIcon, File as FileIcon, Pencil, Trash2, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cohortService } from "@/services/cohortService";
import { taskService } from "@/services/taskService";
import { streamService } from "@/services/streamService";
import { useFetch } from "@/hooks/useFetch";
import { useUser } from "@/hooks/useUser";
import Loader from "@/components/Loader";
import { cn } from "@/lib/utils";
import CreateStreamDialog from "@/components/shared/CreateStreamDialog";
import CreateTaskDialog from "@/components/shared/CreateTaskDialog";

export default function ClassworkPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  const [currentCohort, setCurrentCohort] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateStreamOpen, setIsCreateStreamOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [showCreateOptions, setShowCreateOptions] = useState(false);

  const { response: data } = useFetch(
    () => cohortService.getTrackInActiveCohort(slug)
  );
const track = data?.track
  const userRole = user?.role || 'student';

  // Helper functions to validate required data
  const canCreateContent = () => {
    return currentCohort && track && currentCohort._id &&  track?._id;
  };

  const handleCreateStream = () => {
    console.log('Attempting to create stream...', { 
      currentCohort: currentCohort?._id, 
      track:  track?._id,
      canCreate: canCreateContent()
    });
    
    if (!canCreateContent()) {
      console.error('Missing cohort or track information', {
        currentCohort,
        track,
        hasCurrentCohort: !!currentCohort,
        hasTrack: !!track,
        hasCohortId: !!currentCohort?._id,
        hasTrackId: !! track?._id
      });
      return;
    }
    setIsCreateStreamOpen(true);
    setShowCreateOptions(false);
  };

  const handleCreateTask = () => {
    console.log('Attempting to create task...', { 
      currentCohort: currentCohort?._id, 
      track:  track?._id,
      canCreate: canCreateContent()
    });
    
    if (!canCreateContent()) {
      console.error('Missing cohort or track information', {
        currentCohort,
        track,
        hasCurrentCohort: !!currentCohort,
        hasTrack: !!track,
        hasCohortId: !!currentCohort?._id,
        hasTrackId: !! track?._id
      });
      return;
    }
    setIsCreateTaskOpen(true);
    setShowCreateOptions(false);
  };

  useEffect(() => {
    fetchClassworkData();
  }, [track]);

  const fetchClassworkData = async () => {
    if (!track) return;
    
    try {
      setLoading(true);
      // Get current cohort
      const cohortResponse: any = await cohortService.getCurrentActiveCohort();
      if (cohortResponse.success) {
        setCurrentCohort(cohortResponse.data);
        
        // Get tasks for this cohort and track
        const tasksResponse: any = await taskService.getTasks(
          cohortResponse.data._id,
          track._id,
          1,
          100 // Get all tasks
        );
        
        if (tasksResponse.success) {
          setTasks(tasksResponse.data.tasks || []);
        }
        
        // Get streams (announcements, lessons, materials)
        const streamsResponse: any = await streamService.getStreams(
          cohortResponse.data._id,
          track._id,
          1,
          100 // Get all streams
        );
        
        if (streamsResponse.success) {
          setStreams(streamsResponse.data.streams || []);
        }
      }
    } catch (error) {
      console.error('Error fetching classwork data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
      case 'project':
      case 'quiz':
      case 'reading':
        return <ClipboardList className="h-5 w-5" />;
      case 'announcement':
      case 'lesson':
      case 'update':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <FileIcon className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-orange-100 text-orange-800';
      case 'project':
        return 'bg-red-100 text-red-800';
      case 'quiz':
        return 'bg-yellow-100 text-yellow-800';
      case 'reading':
        return 'bg-gray-100 text-gray-800';
      case 'announcement':
        return 'bg-blue-100 text-blue-800';
      case 'lesson':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Combine and sort all classwork items
  const allClassworkItems = [
    ...tasks.map(task => ({
      id: task._id,
      title: task.title,
      type: task.type,
      description: task.description,
      postedAt: new Date(task.createdAt).toLocaleDateString(),
      dueDate: task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : undefined,
      maxScore: task.maxScore,
      difficulty: task.difficulty,
      attachments: task.resources || [],
      category: 'task'
    })),
    ...streams.map(stream => ({
      id: stream._id,
      title: stream.title,
      type: stream.type,
      description: stream.content,
      postedAt: new Date(stream.createdAt).toLocaleDateString(),
      dueDate: undefined, // Streams don't have due dates
      maxScore: undefined, // Streams don't have scores
      difficulty: undefined, // Streams don't have difficulty
      attachments: stream.attachments || [],
      category: 'stream'
    }))
  ].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  if (loading) return <Loader />;
  if (!track) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold">{ track?.name} - Classwork</h1>
          <p className="text-muted-foreground">{currentCohort?.name}</p>
        </div>
        
        {userRole !== 'student' && canCreateContent() && (
          <DropdownMenu open={showCreateOptions} onOpenChange={setShowCreateOptions}>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto gap-2 rounded-full">
                <Plus className="w-4 h-4" /> Create Content
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleCreateStream}>
                <BookOpen className="h-4 w-4 mr-2" />
                <div>
                  <div className="font-medium">Post Material</div>
                  <div className="text-xs text-muted-foreground">Announcements, lessons, or updates</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateTask}>
                <ClipboardList className="h-4 w-4 mr-2" />
                <div>
                  <div className="font-medium">Create Assignment</div>
                  <div className="text-xs text-muted-foreground">Tasks, projects, quizzes, or readings</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Classwork Items */}
      {allClassworkItems.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No classwork yet</h3>
              <p className="text-muted-foreground">
                {userRole !== 'student' 
                  ? 'Create your first assignment or post learning materials.' 
                  : 'Your mentors haven\'t posted any classwork yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-lg">All Classwork ({allClassworkItems.length})</h3>
          </div>
          
          <div className="space-y-3">
            {allClassworkItems.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors",
                  item.category === 'task' ? 'border-orange-200 bg-orange-50/30' : 'border-blue-200 bg-blue-50/30'
                )}
              >
                <div className={cn(
                  "p-3 rounded-full",
                  item.category === 'task' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                )}>
                  {getTypeIcon(item.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <Badge className={getTypeColor(item.type)} variant="secondary">
                          {item.type}
                        </Badge>
                        {item.difficulty && (
                          <Badge variant="outline" className="text-xs">
                            {item.difficulty}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{item.postedAt}</span>
                        {item.dueDate && (
                          <span className="flex items-center gap-1 text-orange-600 font-medium">
                            <Calendar className="h-3 w-3" />
                            {item.dueDate}
                          </span>
                        )}
                        {item.maxScore && (
                          <span className="text-blue-600 font-medium">{item.maxScore} points</span>
                        )}
                      </div>
                    </div>
                    
                    {userRole !== 'student' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  {item.attachments && item.attachments.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {item.attachments.map((attachment: any, index: number) => (
                          <a 
                            key={index} 
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1 bg-white border rounded-md text-sm hover:bg-gray-50 transition-colors"
                          >
                            {attachment.type === 'link' ? (
                              <LinkIcon className="h-3 w-3" />
                            ) : (
                              <FileIcon className="h-3 w-3" />
                            )}
                            <span>{attachment.title || attachment.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Stream Dialog */}
      {canCreateContent() && (
        <CreateStreamDialog 
          isOpen={isCreateStreamOpen}
          onClose={() => setIsCreateStreamOpen(false)}
          cohortId={currentCohort._id}
          trackId={ track._id}
          trackName={ track.name}
          onSuccess={() => {
            fetchClassworkData();
            setIsCreateStreamOpen(false);
          }}
        />
      )}

      {/* Create Task Dialog */}
      {canCreateContent() && (
        <CreateTaskDialog 
          isOpen={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          cohortId={currentCohort._id}
          trackId={ track._id}
          trackName={ track.name}
          onSuccess={() => {
            fetchClassworkData();
            setIsCreateTaskOpen(false);
          }}
        />
      )}
    </div>
  );
}
