"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  Video, 
  File,
  Loader2,
  Link2
} from "lucide-react";
import { toast } from "sonner";
import uploadService, { UploadedFile } from "@/services/uploadService";

interface LinkAttachment {
  type: 'link';
  url: string;
  title: string;
  description?: string;
  isRequired?: boolean;
}

type AttachmentItem = UploadedFile | LinkAttachment;

interface FileUploadComponentProps {
  type: 'stream' | 'task';
  attachments: AttachmentItem[];
  onAttachmentsChange: (attachments: AttachmentItem[]) => void;
  cohortId: string;
  trackId: string;
  cohortName: string;
  trackName: string;
  maxFiles?: number;
}

export function FileUploadComponent({
  type,
  attachments,
  onAttachmentsChange,
  cohortId,
  trackId,
  cohortName,
  trackName,
  maxFiles = 5
}: FileUploadComponentProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkData, setLinkData] = useState({
    url: '',
    title: '',
    description: '',
    isRequired: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate total attachments count
    if (attachments.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} attachments allowed`);
      return;
    }

    // Validate each file
    const validationErrors: string[] = [];
    Array.from(files).forEach((file, index) => {
      const validation = uploadService.validateFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      toast.error(`File validation failed:\\n${validationErrors.join('\\n')}`);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadFunction = type === 'stream' 
        ? uploadService.uploadStreamFiles 
        : uploadService.uploadTaskFiles;

      const response = type === 'stream'
        ? await uploadService.uploadStreamFiles(
            selectedFiles,
            cohortId,
            trackId,
            cohortName,
            trackName,
            setUploadProgress
          )
        : await uploadService.uploadTaskFiles(
            selectedFiles,
            cohortId,
            trackId,
            cohortName,
            trackName,
            false, // isRequired - will be set individually
            setUploadProgress
          );

      if (response.success) {
        const newFiles = Array.isArray(response.data) ? response.data : [response.data];
        onAttachmentsChange([...attachments, ...newFiles]);
        toast.success(response.message);
        
        // Reset file input
        setSelectedFiles(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(response.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const addLinkAttachment = () => {
    if (!linkData.url.trim() || !linkData.title.trim()) {
      toast.error('Please provide both URL and title for the link');
      return;
    }

    // Basic URL validation
    try {
      new URL(linkData.url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    const newLink: LinkAttachment = {
      type: 'link',
      url: linkData.url,
      title: linkData.title,
      description: linkData.description || undefined,
      isRequired: linkData.isRequired
    };

    onAttachmentsChange([...attachments, newLink]);
    setLinkData({ url: '', title: '', description: '', isRequired: false });
    setShowLinkForm(false);
    toast.success('Link added successfully');
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'link':
        return <Link2 className="h-4 w-4 text-blue-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-green-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-purple-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleRequiredToggle = (index: number, isRequired: boolean) => {
    const updatedAttachments = [...attachments];
    updatedAttachments[index] = { ...updatedAttachments[index], isRequired };
    onAttachmentsChange(updatedAttachments);
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div className="space-y-2">
        <Label>Upload Files (Images, Videos, Documents)</Label>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Max {maxFiles} files, 50MB each. Supports: Images, Videos, PDF, DOCX, PPTX, TXT
          </p>
          
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.docx,.pptx,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || attachments.length >= maxFiles}
            >
              Choose Files
            </Button>
            
            {selectedFiles && selectedFiles.length > 0 && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${selectedFiles.length} file(s)`
                )}
              </Button>
            )}
          </div>

          {isUploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Link Button */}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowLinkForm(true)}
          className="flex items-center gap-2"
          disabled={attachments.length >= maxFiles}
        >
          <Link2 className="h-4 w-4" />
          Add Link
        </Button>
      </div>

      {/* Link Form Modal */}
      {showLinkForm && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium mb-3">Add Link</h4>
          <div className="space-y-3">
            <div>
              <Input
                placeholder="URL (e.g., https://example.com)"
                value={linkData.url}
                onChange={(e) => setLinkData(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div>
              <Input
                placeholder="Title"
                value={linkData.title}
                onChange={(e) => setLinkData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Input
                placeholder="Description (optional)"
                value={linkData.description}
                onChange={(e) => setLinkData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            {type === 'task' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="link-required"
                  checked={linkData.isRequired}
                  onCheckedChange={(checked) => 
                    setLinkData(prev => ({ ...prev, isRequired: Boolean(checked) }))
                  }
                />
                <label htmlFor="link-required" className="text-sm">
                  Required for task completion
                </label>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={addLinkAttachment} size="sm">
                Add Link
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowLinkForm(false);
                  setLinkData({ url: '', title: '', description: '', isRequired: false });
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles && selectedFiles.length > 0 && !isUploading && (
        <div className="space-y-2">
          <Label className="text-sm">Selected Files:</Label>
          <div className="space-y-1">
            {Array.from(selectedFiles).map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                <div className="flex items-center gap-2">
                  {getAttachmentIcon(uploadService.getFileType(file.type))}
                  <span className="font-medium">{file.name}</span>
                  <span className="text-gray-500">({uploadService.formatFileSize(file.size)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">Attachments:</Label>
          <div className="space-y-3">
            {attachments.map((attachment, index) => (
              <div key={index} className="p-3 border rounded-lg bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getAttachmentIcon(attachment.type)}
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {attachment.type === 'link' ? attachment.title : attachment.title}
                      </span>
                      {attachment.type === 'link' && attachment.description && (
                        <span className="text-xs text-muted-foreground">{attachment.description}</span>
                      )}
                      {attachment.type !== 'link' && 'size' in attachment && (
                        <span className="text-gray-500 text-sm">
                          ({uploadService.formatFileSize(attachment.size)})
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedAttachments = attachments.filter((_, i) => i !== index);
                      onAttachmentsChange(updatedAttachments);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {type === 'task' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${index}`}
                      checked={attachment.isRequired || false}
                      onCheckedChange={(checked) => handleRequiredToggle(index, !!checked)}
                    />
                    <Label htmlFor={`required-${index}`} className="text-xs">
                      Required resource
                    </Label>
                  </div>
                )}
                
                <a
                  href={attachment.type === 'link' ? attachment.url : attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline block"
                >
                  {attachment.type === 'link' ? attachment.url : 'View file'}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {attachments.length === 0 && !selectedFiles && (
        <div className="text-center py-2 text-gray-500 text-sm">
          No attachments yet
        </div>
      )}
    </div>
  );
}