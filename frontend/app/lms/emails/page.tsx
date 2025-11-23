"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Plus,
  Send,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Users,
  FileText,
  History,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import { emailService } from "@/services/emailService";
import Loader from "@/components/Loader";

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateType: string;
  variables: string[];
  isActive: boolean;
  createdBy: {
    firstName: string;
    lastName:string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DirectEmail {
  recipient: {
    email: string;
    name: string;
    id?: string;
    type?: "user" | "applicant" | "external";
  };
  subject: string;
  content: string;
  contentType: "html" | "markdown";
  variables?: Record<string, string | number | boolean>;
}

export default function EmailPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("send");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [emailHistory, setEmailHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Direct email form state
  const [directEmail, setDirectEmail] = useState<DirectEmail>({
    recipient: {
      email: "",
      name: "",
      type: "external",
    },
    subject: "",
    content: "",
    contentType: "html",
    variables: {},
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    htmlContent: "",
    textContent: "",
    templateType: "custom" as const,
    variables: [] as string[],
    isActive: true,
  });

  const userRole = user?.role || "student";
  const canManageEmails = userRole === "admin" || userRole === "mentor";

  useEffect(() => {
    if (canManageEmails) {
      fetchTemplates();
      if (activeTab === "history") {
        fetchEmailHistory();
      }
    }
  }, [canManageEmails, activeTab]);

  const fetchEmailHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await emailService.getEmailLogs();
      console.log(response)
      if (response.success && response.data) {
        setEmailHistory(response.data.logs || []);
      }
    } catch (error) {
      console.error("Error fetching email history:", error);
      toast.error("Failed to fetch email history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response:any = await emailService.getEmailTemplates();
      console.log(response)
      if (response.success && response.data) {
        setTemplates(response?.data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to fetch email templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSendDirectEmail = async () => {
    if (!directEmail.recipient.email || !directEmail.recipient.name || !directEmail.subject || !directEmail.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await emailService.sendDirectEmail(directEmail);
      if (response.success) {
        toast.success("Email sent successfully!");
        setDirectEmail({
          recipient: { email: "", name: "", type: "external" },
          subject: "",
          content: "",
          contentType: "html",
          variables: {},
        });
        console.log(response)
        setIsComposeOpen(false);
      } else {
        toast.error(response.message || "Failed to send email");
      }
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast.error(error.message || "Failed to send email");
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.htmlContent) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await emailService.createEmailTemplate(templateForm);
      if (response.success) {
        toast.success("Template created successfully!");
        setTemplateForm({
          name: "",
          subject: "",
          htmlContent: "",
          textContent: "",
          templateType: "custom",
          variables: [],
          isActive: true,
        });
        setIsTemplateDialogOpen(false);
        fetchTemplates();
      } else {
        toast.error(response.message || "Failed to create template");
      }
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast.error(error.message || "Failed to create template");
    }
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent || "",
      templateType: template.templateType as any,
      variables: template.variables,
      isActive: template.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !templateForm.name || !templateForm.subject || !templateForm.htmlContent) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await emailService.updateEmailTemplate(editingTemplate._id, templateForm);
      if (response.success) {
        toast.success("Template updated successfully!");
        setTemplateForm({
          name: "",
          subject: "",
          htmlContent: "",
          textContent: "",
          templateType: "custom",
          variables: [],
          isActive: true,
        });
        setIsEditDialogOpen(false);
        setEditingTemplate(null);
        fetchTemplates();
      } else {
        toast.error(response.message || "Failed to update template");
      }
    } catch (error: any) {
      console.error("Error updating template:", error);
      toast.error(error.message || "Failed to update template");
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await emailService.deleteEmailTemplate(templateId);
      if (response.success) {
        toast.success("Template deleted successfully!");
        fetchTemplates();
      } else {
        toast.error(response.message || "Failed to delete template");
      }
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast.error(error.message || "Failed to delete template");
    }
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case "application_confirmation":
        return "bg-blue-100 text-blue-800";
      case "application_acceptance":
        return "bg-green-100 text-green-800";
      case "application_rejection":
        return "bg-red-100 text-red-800";
      case "assessment_invitation":
        return "bg-purple-100 text-purple-800";
      case "assessment_confirmation":
        return "bg-indigo-100 text-indigo-800";
      case "assessment_review":
        return "bg-pink-100 text-pink-800";
      case "interview_scheduled_notification":
        return "bg-orange-100 text-orange-800";
      case "interview_scheduled_confirmation":
        return "bg-teal-100 text-teal-800";
      case "interview_result_notification":
        return "bg-emerald-100 text-emerald-800";
      case "interview_cancellation_notification":
        return "bg-rose-100 text-rose-800";
      case "interview_reminder_notification":
        return "bg-amber-100 text-amber-800";
      case "password_reset":
        return "bg-cyan-100 text-cyan-800";
      case "welcome_email":
        return "bg-yellow-100 text-yellow-800";
      case "custom":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!canManageEmails) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Access Restricted</h3>
              <p className="text-muted-foreground">
                Only administrators and mentors can access the email system.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Email Management
          </h1>
          <p className="text-muted-foreground">Send emails and manage templates</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Send className="h-4 w-4" />
                Compose Email
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose Email</DialogTitle>
                <DialogDescription>
                  Send a direct email to a recipient
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Recipient Email</Label>
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      value={directEmail.recipient.email}
                      onChange={(e) =>
                        setDirectEmail((prev) => ({
                          ...prev,
                          recipient: { ...prev.recipient, email: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Recipient Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={directEmail.recipient.name}
                      onChange={(e) =>
                        setDirectEmail((prev) => ({
                          ...prev,
                          recipient: { ...prev.recipient, name: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Recipient Type</Label>
                  <Select
                    value={directEmail.recipient.type}
                    onValueChange={(value: "user" | "applicant" | "external") =>
                      setDirectEmail((prev) => ({
                        ...prev,
                        recipient: { ...prev.recipient, type: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="applicant">Applicant</SelectItem>
                      <SelectItem value="external">External</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    placeholder="Email subject"
                    value={directEmail.subject}
                    onChange={(e) =>
                      setDirectEmail((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Content Type</Label>
                  <Select
                    value={directEmail.contentType}
                    onValueChange={(value: "html" | "markdown") =>
                      setDirectEmail((prev) => ({
                        ...prev,
                        contentType: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea
                    placeholder={
                      directEmail.contentType === "markdown"
                        ? "Write your email content in markdown..."
                        : "Write your email content in HTML..."
                    }
                    value={directEmail.content}
                    onChange={(e) =>
                      setDirectEmail((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    rows={8}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendDirectEmail}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send" className="gap-2">
            <Send className="h-4 w-4" />
            Send Email
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Send</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Use the "Compose Email" button above to send direct emails or select from templates below.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Email Templates</h3>
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable email template
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Template Name</Label>
                      <Input
                        placeholder="Template name"
                        value={templateForm.name}
                        onChange={(e) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label>Template Type</Label>
                      <Select
                        value={templateForm.templateType}
                        onValueChange={(value: any) =>
                          setTemplateForm((prev) => ({
                            ...prev,
                            templateType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="welcome_email">Welcome Email</SelectItem>
                          <SelectItem value="application_confirmation">
                            Application Confirmation
                          </SelectItem>
                          <SelectItem value="application_acceptance">
                            Application Acceptance
                          </SelectItem>
                          <SelectItem value="application_rejection">
                            Application Rejection
                          </SelectItem>
                          <SelectItem value="assessment_invitation">
                            Assessment Invitation
                          </SelectItem>
                          <SelectItem value="assessment_confirmation">
                            Assessment Confirmation
                          </SelectItem>
                          <SelectItem value="assessment_review">
                            Assessment Review
                          </SelectItem>
                          <SelectItem value="interview_scheduled_notification">
                            Interview Scheduled (Notification)
                          </SelectItem>
                          <SelectItem value="interview_scheduled_confirmation">
                            Interview Scheduled (Confirmation)
                          </SelectItem>
                          <SelectItem value="interview_result_notification">
                            Interview Result Notification
                          </SelectItem>
                          <SelectItem value="interview_cancellation_notification">
                            Interview Cancellation
                          </SelectItem>
                          <SelectItem value="interview_reminder_notification">
                            Interview Reminder
                          </SelectItem>
                          <SelectItem value="password_reset">
                            Password Reset
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Input
                      placeholder="Email subject"
                      value={templateForm.subject}
                      onChange={(e) =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>HTML Content</Label>
                    <Textarea
                      placeholder="HTML email content"
                      value={templateForm.htmlContent}
                      onChange={(e) =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          htmlContent: e.target.value,
                        }))
                      }
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label>Text Content (Optional)</Label>
                    <Textarea
                      placeholder="Plain text version"
                      value={templateForm.textContent}
                      onChange={(e) =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          textContent: e.target.value,
                        }))
                      }
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsTemplateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {templates.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Templates</h3>
                    <p className="text-muted-foreground">
                      Create your first email template to get started.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              templates.map((template) => (
                <Card key={template._id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{template.name}</h4>
                          <Badge
                            className={getTemplateTypeColor(template.templateType)}
                            variant="secondary"
                          >
                            {template.templateType.replace("_", " ")}
                          </Badge>
                          {template.isActive && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {template.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Created by {template.createdBy?.firstName} {template.createdBy?.lastName} on{" "}
                          {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTemplate(template._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Email History</h3>
            <Button variant="outline" onClick={fetchEmailHistory} disabled={historyLoading}>
              {historyLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          
          {historyLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader />
              </CardContent>
            </Card>
          ) : emailHistory.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Email History</h3>
                  <p className="text-muted-foreground">
                    No emails have been sent yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {emailHistory.map((log: any, index: number) => (
                <Card key={log._id || index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{log.subject || "No Subject"}</h4>
                          <Badge variant={log.status === "sent" ? "default" : "destructive"}>
                            {log.status || "Unknown"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          To: {log.recipientEmail || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Sent on {log.sentAt ? new Date(log.sentAt).toLocaleString() : "Unknown date"}
                        </p>
                      </div>
                      {log.errorMessage && (
                        <div className="text-xs text-red-600 max-w-xs">
                          Error: {log.errorMessage}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Template: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              Template Type: {previewTemplate?.templateType.replace("_", " ")}
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  {previewTemplate.subject}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">HTML Content Preview</Label>
                <div 
                  className="mt-1 p-4 border rounded-md bg-white min-h-[300px]"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.htmlContent }}
                />
              </div>
              {previewTemplate.textContent && (
                <div>
                  <Label className="text-sm font-medium">Text Content</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                    {previewTemplate.textContent}
                  </div>
                </div>
              )}
              {previewTemplate.variables.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Available Variables</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {previewTemplate.variables.map((variable, index) => (
                      <Badge key={index} variant="outline">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Update the email template details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  placeholder="Template name"
                  value={templateForm.name}
                  onChange={(e) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Template Type</Label>
                <Select
                  value={templateForm.templateType}
                  onValueChange={(value: any) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      templateType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="welcome_email">Welcome Email</SelectItem>
                    <SelectItem value="application_confirmation">
                      Application Confirmation
                    </SelectItem>
                    <SelectItem value="application_acceptance">
                      Application Acceptance
                    </SelectItem>
                    <SelectItem value="application_rejection">
                      Application Rejection
                    </SelectItem>
                    <SelectItem value="assessment_invitation">
                      Assessment Invitation
                    </SelectItem>
                    <SelectItem value="assessment_confirmation">
                      Assessment Confirmation
                    </SelectItem>
                    <SelectItem value="assessment_review">
                      Assessment Review
                    </SelectItem>
                    <SelectItem value="interview_scheduled_notification">
                      Interview Scheduled (Notification)
                    </SelectItem>
                    <SelectItem value="interview_scheduled_confirmation">
                      Interview Scheduled (Confirmation)
                    </SelectItem>
                    <SelectItem value="interview_result_notification">
                      Interview Result Notification
                    </SelectItem>
                    <SelectItem value="interview_cancellation_notification">
                      Interview Cancellation
                    </SelectItem>
                    <SelectItem value="interview_reminder_notification">
                      Interview Reminder
                    </SelectItem>
                    <SelectItem value="password_reset">
                      Password Reset
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Email subject"
                value={templateForm.subject}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label>HTML Content</Label>
              <Textarea
                placeholder="HTML email content"
                value={templateForm.htmlContent}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    htmlContent: e.target.value,
                  }))
                }
                rows={6}
              />
            </div>
            <div>
              <Label>Text Content (Optional)</Label>
              <Textarea
                placeholder="Plain text version"
                value={templateForm.textContent}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    textContent: e.target.value,
                  }))
                }
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={templateForm.isActive}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="isActive">Active Template</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingTemplate(null);
                setTemplateForm({
                  name: "",
                  subject: "",
                  htmlContent: "",
                  textContent: "",
                  templateType: "custom",
                  variables: [],
                  isActive: true,
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate}>
              Update Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}