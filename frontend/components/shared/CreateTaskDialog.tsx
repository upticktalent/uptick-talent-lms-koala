"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { taskService } from "@/services/taskService";
import { FileUploadComponent } from "./FileUploadComponent";
import { UploadedFile } from "@/services/uploadService";

interface LinkAttachment {
  type: 'link';
  url: string;
  title: string;
  description?: string;
  isRequired?: boolean;
}

type AttachmentItem = UploadedFile | LinkAttachment;

interface TaskFormData {
  title: string;
  description: string;
  type: 'assignment' | 'project' | 'quiz' | 'reading';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  maxScore: number;
  dueDate: string;
  requirements: string[];
  allowLateSubmissions: boolean;
  resources: AttachmentItem[];
}

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cohortId: string;
  trackId: string;
  trackName?: string;
  onSuccess?: () => void;
}

export default function CreateTaskDialog({
  isOpen,
  onClose,
  cohortId,
  trackId,
  trackName,
  onSuccess,
}: CreateTaskDialogProps) {
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    type: 'assignment',
    difficulty: 'beginner',
    estimatedHours: 1,
    maxScore: 100,
    dueDate: '',
    requirements: [],
    allowLateSubmissions: true,
    resources: [],
  });

  const [newRequirement, setNewRequirement] = useState('');

  const resetForm = () => {
    setTaskFormData({
      title: '',
      description: '',
      type: 'assignment',
      difficulty: 'beginner',
      estimatedHours: 1,
      maxScore: 100,
      dueDate: '',
      requirements: [],
      allowLateSubmissions: true,
      resources: [],
    });
    setNewRequirement('');
  };

  const handleResourcesChange = (resources: AttachmentItem[]) => {
    setTaskFormData(prev => ({
      ...prev,
      resources
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setTaskFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setTaskFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleCreateTask = async () => {
    if (!cohortId || !trackId) {
      toast.error('Missing cohort or track information');
      return;
    }

    if (!taskFormData.title.trim() || !taskFormData.description.trim()) {
      toast.error('Please fill in both title and description');
      return;
    }

    try {
      const taskPayload: any = {
        cohortId,
        trackId,
        title: taskFormData.title,
        description: taskFormData.description,
        type: taskFormData.type,
        difficulty: taskFormData.difficulty,
        estimatedHours: taskFormData.estimatedHours,
        maxScore: taskFormData.maxScore,
        requirements: taskFormData.requirements,
        allowLateSubmissions: taskFormData.allowLateSubmissions,
        resources: taskFormData.resources,
      };
      
      if (taskFormData.dueDate) {
        taskPayload.dueDate = taskFormData.dueDate;
      }
      
      const response = await taskService.createTask(taskPayload);

      if (response.success) {
        toast.success('Task created successfully!');
        onClose();
        resetForm();
        onSuccess?.();
      } else {
        toast.error(response.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Create assignments, projects, quizzes, or reading materials for {trackName || 'the track'}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={taskFormData.title}
              onChange={(e) =>
                setTaskFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Task title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-type">Type</Label>
              <Select
                value={taskFormData.type}
                onValueChange={(value: 'assignment' | 'project' | 'quiz' | 'reading') =>
                  setTaskFormData((prev) => ({
                    ...prev,
                    type: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-difficulty">Difficulty</Label>
              <Select
                value={taskFormData.difficulty}
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                  setTaskFormData((prev) => ({
                    ...prev,
                    difficulty: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-hours">Estimated Hours</Label>
              <Input
                id="task-hours"
                type="number"
                min="1"
                value={taskFormData.estimatedHours}
                onChange={(e) =>
                  setTaskFormData((prev) => ({
                    ...prev,
                    estimatedHours: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-score">Max Score</Label>
              <Input
                id="task-score"
                type="number"
                min="1"
                value={taskFormData.maxScore}
                onChange={(e) =>
                  setTaskFormData((prev) => ({
                    ...prev,
                    maxScore: parseInt(e.target.value) || 100,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due">Due Date *</Label>
              <Input
                id="task-due"
                type="datetime-local"
                value={taskFormData.dueDate}
                onChange={(e) =>
                  setTaskFormData((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={taskFormData.description}
              onChange={(e) =>
                setTaskFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the task requirements, objectives, and deliverables..."
              rows={4}
            />
          </div>

          {/* Requirements Section */}
          <div className="space-y-2">
            <Label>Requirements</Label>
            <div className="flex gap-2">
              <Input
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder="Add a requirement..."
                onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
              />
              <Button type="button" onClick={addRequirement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {taskFormData.requirements.length > 0 && (
              <div className="space-y-1">
                {taskFormData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{req}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resources Section */}
          <FileUploadComponent
            type="task"
            cohortId={cohortId}
            trackId={trackId}
            cohortName={trackName || 'default'}
            trackName={trackName || 'default'}
            attachments={taskFormData.resources}
            onAttachmentsChange={handleResourcesChange}
            maxFiles={10}
          />

          {/* Settings */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="late-submissions"
              checked={taskFormData.allowLateSubmissions}
              onCheckedChange={(checked) =>
                setTaskFormData((prev) => ({
                  ...prev,
                  allowLateSubmissions: !!checked,
                }))
              }
            />
            <Label htmlFor="late-submissions" className="text-sm">
              Allow late submissions
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateTask}>
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}