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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { streamService } from "@/services/streamService";
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

interface StreamFormData {
  title: string;
  content: string;
  type: 'announcement' | 'lesson' | 'update';
  scheduledFor: string;
  attachments: AttachmentItem[];
}

interface CreateStreamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  cohortId: string;
  trackId: string;
  trackName?: string;
  onSuccess?: () => void;
}

export default function CreateStreamDialog({
  isOpen,
  onClose,
  cohortId,
  trackId,
  trackName,
  onSuccess,
}: CreateStreamDialogProps) {
  const [streamFormData, setStreamFormData] = useState<StreamFormData>({
    title: '',
    content: '',
    type: 'announcement',
    scheduledFor: '',
    attachments: [],
  });

  const resetForm = () => {
    setStreamFormData({
      title: '',
      content: '',
      type: 'announcement',
      scheduledFor: '',
      attachments: [],
    });
  };

  const handleAttachmentsChange = (attachments: AttachmentItem[]) => {
    setStreamFormData(prev => ({
      ...prev,
      attachments
    }));
  };

  const handleCreateStream = async () => {
    if (!cohortId || !trackId) {
      toast.error('Missing cohort or track information');
      return;
    }

    if (!streamFormData.title.trim() || !streamFormData.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    try {
      const response = await streamService.createStream({
        cohortId,
        trackId,
        title: streamFormData.title,
        content: streamFormData.content,
        type: streamFormData.type,
        scheduledFor: streamFormData.scheduledFor || undefined,
        attachments: streamFormData.attachments,
      });

      if (response.success) {
        toast.success('Stream created successfully!');
        onClose();
        resetForm();
        onSuccess?.();
      } else {
        toast.error(response.message || 'Failed to create stream');
      }
    } catch (error) {
      console.error('Error creating stream:', error);
      toast.error('Failed to create stream');
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Stream</DialogTitle>
          <DialogDescription>
            Share announcements, lessons, or updates with {trackName || 'the track'}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stream-title">Title</Label>
            <Input
              id="stream-title"
              value={streamFormData.title}
              onChange={(e) =>
                setStreamFormData((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Stream title..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stream-type">Type</Label>
              <Select
                value={streamFormData.type}
                onValueChange={(value: 'announcement' | 'lesson' | 'update') =>
                  setStreamFormData((prev) => ({
                    ...prev,
                    type: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="lesson">Lesson</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stream-scheduled">
                Schedule For (Optional)
              </Label>
              <Input
                id="stream-scheduled"
                type="datetime-local"
                value={streamFormData.scheduledFor}
                onChange={(e) =>
                  setStreamFormData((prev) => ({
                    ...prev,
                    scheduledFor: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stream-content">Content</Label>
            <Textarea
              id="stream-content"
              value={streamFormData.content}
              onChange={(e) =>
                setStreamFormData((prev) => ({
                  ...prev,
                  content: e.target.value,
                }))
              }
              placeholder="Write your content here..."
              rows={6}
            />
          </div>

          {/* Attachments Section */}
          <FileUploadComponent
            type="stream"
            cohortId={cohortId}
            trackId={trackId}
            cohortName={trackName || 'default'}
            trackName={trackName || 'default'}
            attachments={streamFormData.attachments}
            onAttachmentsChange={handleAttachmentsChange}
            maxFiles={5}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateStream}>
            Create Stream
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}