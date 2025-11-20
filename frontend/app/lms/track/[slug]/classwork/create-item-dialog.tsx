"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, Link as LinkIcon, X, File as FileIcon, Image as ImageIcon } from "lucide-react";

export type ClassworkItemType = 'task' | 'material';

export interface Attachment {
  id: string;
  type: 'link' | 'image' | 'file';
  url?: string;
  name?: string;
  file?: File;
}

export interface CreateItemData {
  title: string;
  description: string;
  dueDate?: string;
  attachments: Attachment[];
}

interface CreateClassworkItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ClassworkItemType | null;
  initialData?: CreateItemData;
  onCreate: (data: CreateItemData) => void;
}

export default function CreateClassworkItemDialog({
  open,
  onOpenChange,
  type,
  initialData,
  onCreate
}: CreateClassworkItemDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // Link Dialog State (Nested or inline)
  const [isLinkInputVisible, setIsLinkInputVisible] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Reset or Populate form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open && initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description);
        setDueDate(initialData.dueDate || "");
        setAttachments(initialData.attachments);
    } else if (open && !initialData) {
        resetFormState();
    }
  }, [open, initialData]);

  const handleCreate = () => {
    onCreate({
      title,
      description,
      dueDate: type === 'task' ? dueDate : undefined,
      attachments
    });
    // Don't reset here, let parent close it or we close it
    onOpenChange(false);
  };

  const resetFormState = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setAttachments([]);
    setIsLinkInputVisible(false);
    setLinkUrl("");
  };

  const resetForm = () => {
    resetFormState();
    onOpenChange(false);
  };

  const addLink = () => {
    if (linkUrl) {
      setAttachments([...attachments, { id: Date.now().toString(), type: 'link', url: linkUrl, name: linkUrl }]);
      setLinkUrl("");
      setIsLinkInputVisible(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        type,
        name: file.name,
        file,
        url: type === 'image' ? URL.createObjectURL(file) : undefined
      };
      setAttachments([...attachments, newAttachment]);
      e.target.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  if (!type) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && resetForm()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Create'} {type === 'task' ? 'Task' : 'Material'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`e.g., ${type === 'task' ? 'Week 1 Assignment' : 'Lecture Slides'}`}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add instructions or details..."
              className="min-h-[100px]"
            />
          </div>

          {type === 'task' && (
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input 
                id="dueDate" 
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="e.g., Tomorrow, 10 AM"
              />
            </div>
          )}

          {/* Attachments Section */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            
            {/* List */}
            {attachments.length > 0 && (
                <div className="space-y-2 mb-2">
                    {attachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center shrink-0">
                                    {att.type === 'link' && <LinkIcon className="w-4 h-4 text-gray-500" />}
                                    {att.type === 'file' && <FileIcon className="w-4 h-4 text-gray-500" />}
                                    {att.type === 'image' && att.url && (
                                        <img src={att.url} alt="Preview" className="w-full h-full object-cover rounded" />
                                    )}
                                </div>
                                <div className="truncate text-sm text-gray-700">
                                    {att.name || att.url}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAttachment(att.id)}>
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Buttons */}
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsLinkInputVisible(true)}>
                    <LinkIcon className="w-4 h-4 mr-2" /> Link
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <FileIcon className="w-4 h-4 mr-2" /> File
                </Button>
                <Button variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
                    <ImageIcon className="w-4 h-4 mr-2" /> Image
                </Button>
            </div>

            {/* Inline Link Input */}
            {isLinkInputVisible && (
                <div className="flex gap-2 items-center mt-2">
                    <Input 
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1"
                        autoFocus
                        onKeyDown={(e) => { if(e.key === 'Enter') addLink(); }}
                    />
                    <Button size="sm" onClick={addLink}>Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsLinkInputVisible(false)}>Cancel</Button>
                </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>{initialData ? 'Save Changes' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>

      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={(e) => handleFileChange(e, 'file')} 
      />
      <input 
        type="file" 
        ref={imageInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'image')} 
      />
    </Dialog>
  );
}
