"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Link as LinkIcon, Image as ImageIcon, X, File as FileIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnnouncementInputProps {
  trackName: string;
  onPost?: (content: string, attachments: Attachment[]) => void;
}

export type AttachmentType = 'link' | 'image' | 'file';

export interface Attachment {
  id: string;
  type: AttachmentType;
  url?: string;
  name?: string;
  file?: File;
}

export default function AnnouncementInput({ trackName, onPost }: AnnouncementInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  // Link Dialog State
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // File Input Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handlePost = () => {
    if (onPost) {
      onPost(content, attachments);
    }
    console.log("Posting announcement:", content, attachments);
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
  };

  const resetForm = () => {
    setContent("");
    setAttachments([]);
    setIsExpanded(false);
  };

  const addLink = () => {
    if (linkUrl) {
      setAttachments([...attachments, { id: Date.now().toString(), type: 'link', url: linkUrl, name: linkUrl }]);
      setLinkUrl("");
      setIsLinkDialogOpen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: AttachmentType) => {
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
      // Reset input value so same file can be selected again if needed
      e.target.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  return (
    <>
      <Card className={`border border-gray-200 shadow-sm transition-all ${isExpanded ? 'ring-1 ring-blue-200' : 'cursor-pointer hover:shadow-md'}`}>
        <CardContent className="p-4">
          {isExpanded ? (
              <div className="space-y-4">
                  <Textarea
                      placeholder="Announce something to your class"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="min-h-[120px] bg-gray-50 border-none resize-none focus-visible:ring-0 p-0 text-base"
                      autoFocus
                  />
                  
                  {/* Attachments List */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                        {attachments.map(att => (
                            <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center shrink-0">
                                        {att.type === 'link' && <LinkIcon className="w-5 h-5 text-gray-500" />}
                                        {att.type === 'file' && <FileIcon className="w-5 h-5 text-gray-500" />}
                                        {att.type === 'image' && att.url && (
                                            <img src={att.url} alt="Preview" className="w-full h-full object-cover rounded" />
                                        )}
                                    </div>
                                    <div className="truncate text-sm text-gray-700 font-medium">
                                        {att.name || att.url}
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => removeAttachment(att.id)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50" title="Add file" onClick={() => fileInputRef.current?.click()}>
                              <Upload className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50" title="Add link" onClick={() => setIsLinkDialogOpen(true)}>
                              <LinkIcon className="w-5 h-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50" title="Add image" onClick={() => imageInputRef.current?.click()}>
                              <ImageIcon className="w-5 h-5" />
                          </Button>
                      </div>
                      <div className="flex gap-2">
                          <Button variant="ghost" onClick={handleCancel}>
                              Cancel
                          </Button>
                          <Button 
                              onClick={handlePost} 
                              disabled={!content.trim() && attachments.length === 0}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                              Post
                          </Button>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="flex items-center gap-4" onClick={() => setIsExpanded(true)}>
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                      {trackName.charAt(0)}
                  </div>
                  <div className="flex-1 text-gray-500 text-sm hover:text-gray-700">
                      Announce something to your class
                  </div>
              </div>
          )}
        </CardContent>
      </Card>

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

      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-url">Link URL</Label>
              <Input 
                id="link-url" 
                placeholder="https://example.com" 
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') addLink(); }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>Cancel</Button>
            <Button onClick={addLink} disabled={!linkUrl}>Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
