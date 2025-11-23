"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cohortService } from "@/services/cohortService";
import { streamService } from "@/services/streamService";
import { taskService } from "@/services/taskService";
import { useFetch } from "@/hooks/useFetch";
import { useUser } from "@/hooks/useUser";
import { MessageSquare, MoreVertical, FileText, Info, Eye, Trash2, Calendar, ThumbsUp, Heart, CheckCircle, HelpCircle, Link2, Image, Video } from "lucide-react";
import Loader from "@/components/Loader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Plus } from "lucide-react";
import CreateStreamDialog from "@/components/shared/CreateStreamDialog";

export default function StreamPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();
  
  // All hooks must be called before any early returns
  const { response: data, loading } = useFetch(
    () => cohortService.getTrackInActiveCohort(slug)
  );
  const track = data?.track;
  console.log(track)
  const [streams, setStreams] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentCohort, setCurrentCohort] = useState<any>(null);
  const [fetchingStreams, setFetchingStreams] = useState(true);
  const [viewingItem, setViewingItem] = useState<any | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);

  // Stream creation
  const [createStreamOpen, setCreateStreamOpen] = useState(false);

  useEffect(() => {
    fetchStreamData();
  }, [track]);

  const fetchStreamData = async () => {
    if (!track) return;
    
    try {
      setFetchingStreams(true);
      // Get current cohort
      const cohortResponse: any = await cohortService.getCurrentActiveCohort();
      if (cohortResponse.success) {
        setCurrentCohort(cohortResponse.data);
        
        // Get streams for this cohort and track
        const streamsResponse: any = await streamService.getStreams(
          cohortResponse.data._id,
          track._id,
          1,
          50 // Get recent streams
        );
        
        if (streamsResponse.success) {
          setStreams(streamsResponse.data.streams || []);
        }
        
        // Get tasks for this cohort and track (to show in stream)
        const tasksResponse: any = await taskService.getTasks(
          cohortResponse.data._id,
          track._id,
          1,
          20 // Get recent tasks
        );
        
        if (tasksResponse.success) {
          setTasks(tasksResponse.data.tasks || []);
        }

        // Get upcoming tasks for students
        if (user?.role === 'student') {
          await fetchUpcomingTasks(cohortResponse.data._id, track._id);
        }
      }
    } catch (error) {
      console.error('Error fetching stream data:', error);
    } finally {
      setFetchingStreams(false);
    }
  };

  const fetchUpcomingTasks = async (cohortId: string, trackId: string) => {
    try {
      const tasksResponse: any = await taskService.getTasks(
        cohortId,
        trackId,
        1,
        50 // Get all tasks to filter upcoming ones
      );
      
      if (tasksResponse.success) {
        const allTasks = tasksResponse.data.tasks || [];
        const currentDate = new Date();
        const next7Days = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        // Filter tasks that are due within the next 7 days and not yet submitted
        const upcoming = allTasks.filter((task: any) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= currentDate && dueDate <= next7Days;
        }).sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        
        setUpcomingTasks(upcoming.slice(0, 3)); // Show only first 3 upcoming tasks
      }
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-blue-100 text-blue-800';
      case 'lesson':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-purple-100 text-purple-800';
      case 'assignment':
        return 'bg-orange-100 text-orange-800';
      case 'project':
        return 'bg-red-100 text-red-800';
      case 'quiz':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddReaction = async (streamId: string, type: 'like' | 'love' | 'helpful' | 'confused') => {
    try {
      await streamService.addReaction(streamId, type);
      fetchStreamData(); // Refresh to show updated reactions
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleDelete = (id: string, type: 'stream' | 'task') => {
    if (confirm("Are you sure you want to delete this item?")) {
      if (type === 'stream') {
        setStreams(streams.filter(item => item._id !== id));
      } else {
        setTasks(tasks.filter(item => item._id !== id));
      }
    }
  };



  // Combine streams and tasks into a unified feed
  const allFeedItems = [
    ...streams.map(stream => ({
      ...stream,
      feedType: 'stream',
      author: `${stream.createdBy?.firstName || 'Unknown'} ${stream.createdBy?.lastName || 'User'}`,
      date: new Date(stream.createdAt).toLocaleDateString()
    })),
    ...tasks.map(task => ({
      ...task,
      feedType: 'task',
      author: `${task.createdBy?.firstName || 'Unknown'} ${task.createdBy?.lastName || 'User'}`,
      date: new Date(task.createdAt).toLocaleDateString(),
      content: task.description
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Now we can safely do early returns after all hooks are called
  if (loading || fetchingStreams) return <Loader />;
  if (!track) return null;

  return (
    <div className=" space-y-6">
      {/* Banner */}
      <div className="relative space-y-6 mt-6 w-full h-60 rounded-xl overflow-hidden bg-linear-to-r from-blue-600 to-blue-400 text-white p-8 flex flex-col justify-end">
        <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">{track.name}</h1>
            <p className="text-xl opacity-90">Uptick Talent Engineering Fellowship</p>
        </div>
        {/* Decorative Circle/Graphic Placeholder */}
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
            <div className="w-96 h-96 rounded-full bg-white"></div>
        </div>
        <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-white hover:bg-white/20 rounded-full">
            <Info className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Upcoming - Students Only */}
        {user?.role === 'student' && (
          <div className="lg:col-span-1 space-y-6">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length === 0 ? (
                  <p className="text-sm text-gray-500 mb-4">Woohoo, no work due in soon!</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {upcomingTasks.map((task: any) => (
                      <div key={task._id} className="p-3 border rounded-lg bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">{task.title}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="capitalize">{task.type}</span>
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`mt-2 text-xs ${
                            task.difficulty === 'beginner' ? 'bg-green-50 text-green-700 border-green-200' :
                            task.difficulty === 'intermediate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {task.difficulty}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm text-blue-600 font-medium"
                    onClick={() => window.location.href = `/lms/track/${slug}/classwork`}
                  >
                    View all
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Right Column: Stream Feed */}
        <div className={`space-y-6 ${user?.role === 'student' ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          {/* Create Stream Section */}
          {(user?.role === 'mentor' || user?.role === 'admin') && (
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Share something with {track?.name || 'the track'}</h3>
                    <p className="text-xs text-muted-foreground">Create announcements, lessons, or updates</p>
                  </div>
                  <Button onClick={() => setCreateStreamOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Stream
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stream Items */}
          <div className="space-y-4">
            {allFeedItems.length === 0 ? (
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No activity yet</h3>
                    <p className="text-muted-foreground">
                      {user?.role !== 'student' 
                        ? 'Post your first announcement or create a task to get started.' 
                        : 'Your mentors haven\'t posted any content yet.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              allFeedItems.map((item) => (
                <Card key={item._id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-4 flex-1" onClick={() => setViewingItem(item)}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        item.feedType === 'task' ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {item.feedType === 'task' ? <FileText className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            <span className="font-semibold">{item.author}</span> posted a new {item.feedType === 'task' ? item.type : item.type}: 
                            <span className="font-semibold ml-1">{item.title}</span>
                          </h3>
                          <Badge className={getTypeColor(item.type)} variant="secondary">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{item.date}</span>
                          {item.feedType === 'task' && item.dueDate && (
                            <span className="flex items-center gap-1 text-orange-600 font-medium">
                              <Calendar className="h-3 w-3" />
                              Due {new Date(item.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          {item.feedType === 'task' && item.maxScore && (
                            <span className="text-blue-600 font-medium">{item.maxScore} points</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {(user?.role === 'mentor' || user?.role === 'admin') && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingItem(item)}>
                            <Eye className="w-4 h-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(item._id, item.feedType)} 
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardHeader>
                  
                  {/* Content Preview for Streams */}
                  {item.feedType === 'stream' && item.content && (
                    <CardContent className="pt-0 pb-4 px-4 ml-14">
                      <p className="text-sm text-gray-700 line-clamp-3">{item.content}</p>
                      
                      {/* Attachments Preview */}
                      {item.attachments && item.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {item.attachments.slice(0, 2).map((attachment: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border text-sm">
                              {attachment.type === 'link' && <Link2 className="h-4 w-4 text-blue-500 shrink-0" />}
                              {attachment.type === 'image' && <Image className="h-4 w-4 text-green-500 shrink-0" />}
                              {attachment.type === 'video' && <Video className="h-4 w-4 text-purple-500 shrink-0" />}
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate">{attachment.title}</p>
                                {attachment.description && (
                                  <p className="text-xs text-gray-500 truncate">{attachment.description}</p>
                                )}
                              </div>
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Open
                              </a>
                            </div>
                          ))}
                          {item.attachments.length > 2 && (
                            <p className="text-xs text-gray-500 pl-2">
                              +{item.attachments.length - 2} more attachment{item.attachments.length - 2 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Attachments */}
                      {item.attachments && item.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {item.attachments.slice(0, 2).map((attachment: any) => (
                            <div key={attachment._id} className="flex items-center gap-2 p-2 border rounded">
                              <FileText className="h-4 w-4" />
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline truncate"
                              >
                                {attachment.title}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Reactions for Streams */}
                      <div className="flex items-center gap-4 pt-4 border-t mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddReaction(item._id, 'like')}
                          className="text-muted-foreground hover:text-blue-600"
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {item.reactions?.filter((r: any) => r.type === 'like').length || 0}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddReaction(item._id, 'love')}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          {item.reactions?.filter((r: any) => r.type === 'love').length || 0}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddReaction(item._id, 'helpful')}
                          className="text-muted-foreground hover:text-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {item.reactions?.filter((r: any) => r.type === 'helpful').length || 0}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddReaction(item._id, 'confused')}
                          className="text-muted-foreground hover:text-yellow-600"
                        >
                          <HelpCircle className="h-4 w-4 mr-1" />
                          {item.reactions?.filter((r: any) => r.type === 'confused').length || 0}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {item.comments?.length || 0}
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* View Item Dialog */}
      <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingItem?.feedType === 'task' ? 
                <FileText className="w-5 h-5 text-orange-600" /> : 
                <MessageSquare className="w-5 h-5 text-blue-600" />
              }
              {viewingItem?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4">
              <span>Posted by {viewingItem?.author} on {viewingItem?.date}</span>
              {viewingItem?.type && (
                <Badge className={getTypeColor(viewingItem.type)} variant="secondary">
                  {viewingItem.type}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {viewingItem?.content || viewingItem?.description || "No content available."}
              </p>
            </div>
            
            {/* Task specific details */}
            {viewingItem?.feedType === 'task' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                {viewingItem?.dueDate && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Due Date:</span>
                    <p className="text-sm">{new Date(viewingItem.dueDate).toLocaleDateString()}</p>
                  </div>
                )}
                {viewingItem?.maxScore && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Max Score:</span>
                    <p className="text-sm">{viewingItem.maxScore} points</p>
                  </div>
                )}
                {viewingItem?.difficulty && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Difficulty:</span>
                    <p className="text-sm capitalize">{viewingItem.difficulty}</p>
                  </div>
                )}
                {viewingItem?.estimatedHours && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Estimated Hours:</span>
                    <p className="text-sm">{viewingItem.estimatedHours}h</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Requirements for tasks */}
            {viewingItem?.requirements && viewingItem.requirements.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Requirements:</h4>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {viewingItem.requirements.map((req: string, index: number) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Attachments */}
            {((viewingItem?.attachments && viewingItem.attachments.length > 0) || 
              (viewingItem?.resources && viewingItem.resources.length > 0)) && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {viewingItem?.feedType === 'task' ? 'Resources:' : 'Attachments:'}
                </h4>
                <div className="space-y-3">
                  {(viewingItem?.attachments || viewingItem?.resources || []).map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50">
                      <div className="shrink-0 mt-0.5">
                        {(item.type === 'link' || (!item.type && item.url)) && (
                          <Link2 className="h-4 w-4 text-blue-500" />
                        )}
                        {item.type === 'image' && <Image className="h-4 w-4 text-green-500" />}
                        {item.type === 'video' && <Video className="h-4 w-4 text-purple-500" />}
                        {!item.type && !item.url && <FileText className="h-4 w-4 text-gray-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-sm font-medium text-gray-900">
                            {item.title || item.name || `Attachment ${index + 1}`}
                          </h5>
                          {item.isRequired && (
                            <Badge variant="outline" className="text-xs">Required</Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          Open {item.type || 'attachment'}
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Stream Dialog */}
      {currentCohort && track && (
        <CreateStreamDialog
          isOpen={createStreamOpen}
          onClose={() => setCreateStreamOpen(false)}
          cohortId={currentCohort._id}
          trackId={track._id}
          trackName={track.name}
          onSuccess={fetchStreamData}
        />
      )}
    </div>
  );
}
