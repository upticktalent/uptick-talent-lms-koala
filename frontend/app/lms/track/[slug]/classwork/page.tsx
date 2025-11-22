"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, BookOpen, MoreVertical, UserSquare2, Link as LinkIcon, File as FileIcon, Pencil, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authService } from "@/services/authService";
import { cn } from "@/lib/utils";
import CreateClassworkItemDialog, { CreateItemData, ClassworkItemType, Attachment } from "./create-item-dialog";

// Types
interface ClassworkItem {
  id: string;
  title: string;
  type: ClassworkItemType;
  postedAt: string;
  dueDate?: string;
  description?: string;
  attachments: Attachment[];
}

interface Topic {
  id: string;
  title: string;
  items: ClassworkItem[];
}

export default function ClassworkPage() {
  const [topics, setTopics] = useState<Topic[]>([
    {
      id: '1',
      title: 'Week 1',
      items: [
        { 
            id: '101', 
            title: 'Internet and World Wide Web', 
            type: 'material', 
            postedAt: 'Posted 30 Jun',
            description: 'Introduction to how the internet works.',
            attachments: []
        },
        { 
            id: '102', 
            title: 'WEEK 1 TASK', 
            type: 'task', 
            postedAt: 'Posted 1 Jul',
            dueDate: 'Due 7 Jul, 12:00',
            description: 'Complete the exercises in the attached document.',
            attachments: []
        }
      ]
    }
  ]);

  const [userRole, setUserRole] = useState<'admin' | 'mentor' | 'student'>('student');
  
  // Topic State
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [topicTitle, setTopicTitle] = useState("");
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  // Item State
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [activeItemType, setActiveItemType] = useState<ClassworkItemType | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemInitialData, setItemInitialData] = useState<CreateItemData | undefined>(undefined);
  
  // UI State
  const [selectedTopicFilter, setSelectedTopicFilter] = useState("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUser = async () => {
        try {
            const response = await authService.getCurrentUser();
            if (response.data && response.data.role) {
                setUserRole(response.data.role);
            } else {
                 setUserRole('mentor'); // Fallback for demo
            }
        } catch (error) {
            console.error("Failed to fetch user", error);
            setUserRole('mentor'); // Fallback for demo
        }
    };
    fetchUser();
  }, []);

  // Topic Handlers
  const handleCreateOrUpdateTopic = () => {
    if (!topicTitle.trim()) return;

    if (editingTopicId) {
        // Update
        setTopics(topics.map(t => t.id === editingTopicId ? { ...t, title: topicTitle } : t));
    } else {
        // Create
        const newTopic: Topic = {
            id: Date.now().toString(),
            title: topicTitle,
            items: []
        };
        setTopics([newTopic, ...topics]);
    }
    closeTopicDialog();
  };

  const openCreateTopicDialog = () => {
    setEditingTopicId(null);
    setTopicTitle("");
    setIsCreateTopicOpen(true);
  };

  const openEditTopicDialog = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setTopicTitle(topic.title);
    setIsCreateTopicOpen(true);
  };

  const closeTopicDialog = () => {
    setIsCreateTopicOpen(false);
    setEditingTopicId(null);
    setTopicTitle("");
  };

  const handleDeleteTopic = (topicId: string) => {
        setTopics(topics.filter(t => t.id !== topicId));
        if (selectedTopicFilter === topicId) setSelectedTopicFilter("all");
  };

  // Item Handlers
  const openCreateItemDialog = (topicId: string, type: ClassworkItemType) => {
    setActiveTopicId(topicId);
    setActiveItemType(type);
    setEditingItemId(null);
    setItemInitialData(undefined);
    setIsCreateItemOpen(true);
  };

  const openEditItemDialog = (topicId: string, item: ClassworkItem) => {
    setActiveTopicId(topicId);
    setActiveItemType(item.type);
    setEditingItemId(item.id);
    setItemInitialData({
        title: item.title,
        description: item.description || "",
        dueDate: item.dueDate,
        attachments: item.attachments
    });
    setIsCreateItemOpen(true);
  };

  const handleCreateOrUpdateItem = (data: CreateItemData) => {
    if (!activeTopicId || !activeItemType) return;

    if (editingItemId) {
        // Update
        setTopics(topics.map(topic => {
            if (topic.id === activeTopicId) {
                return {
                    ...topic,
                    items: topic.items.map(item => {
                        if (item.id === editingItemId) {
                            return {
                                ...item,
                                title: data.title,
                                description: data.description,
                                dueDate: data.dueDate,
                                attachments: data.attachments
                            };
                        }
                        return item;
                    })
                };
            }
            return topic;
        }));
    } else {
        // Create
        const newItem: ClassworkItem = {
            id: Date.now().toString(),
            title: data.title,
            type: activeItemType,
            postedAt: `Posted ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`,
            dueDate: data.dueDate,
            description: data.description,
            attachments: data.attachments
        };

        setTopics(topics.map(topic => {
            if (topic.id === activeTopicId) {
                return { ...topic, items: [newItem, ...topic.items] };
            }
            return topic;
        }));
    }

    setIsCreateItemOpen(false);
    setActiveTopicId(null);
    setActiveItemType(null);
    setEditingItemId(null);
    setItemInitialData(undefined);
  };

  const handleDeleteItem = (topicId: string, itemId: string) => {
    setTopics(topics.map(topic => {
        if (topic.id === topicId) {
            return { ...topic, items: topic.items.filter(i => i.id !== itemId) };
        }
        return topic;
    }));
  };

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState<string | undefined>(undefined);
  const [confirmAction, setConfirmAction] = useState<(() => void | Promise<void>) | null>(null);

  const requestConfirm = (title: string, description: string | undefined, action: () => void | Promise<void>) => {
    setConfirmTitle(title);
    setConfirmDescription(description);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId);
    } else {
        newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const canEdit = userRole === 'admin' || userRole === 'mentor';

  const filteredTopics = selectedTopicFilter === 'all' 
    ? topics 
    : topics.filter(t => t.id === selectedTopicFilter);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div className="w-full sm:w-[200px]">
            <Label className="text-xs text-gray-500 mb-1.5 block">Topic filter</Label>
            <Select value={selectedTopicFilter} onValueChange={setSelectedTopicFilter}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="All topics" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All topics</SelectItem>
                    {topics.map(topic => (
                        <SelectItem key={topic.id} value={topic.id}>{topic.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="w-full sm:w-auto">
            {canEdit ? (
                <Button className="w-full sm:w-auto gap-2 rounded-full" onClick={openCreateTopicDialog}>
                    <Plus className="w-4 h-4" /> Create Topic
                </Button>
            ) : (
                <Button variant="outline" className="w-full sm:w-auto gap-2 rounded-full text-blue-600 border-gray-300 hover:bg-blue-50">
                    <UserSquare2 className="w-4 h-4" /> View your work
                </Button>
            )}
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-8 sm:space-y-10">
        {filteredTopics.map((topic) => (
            <div key={topic.id} className="space-y-4">
                {/* Topic Header */}
                <div className="flex items-center justify-between border-b border-blue-600 pb-3 sm:pb-4">
                    <h2 className="text-2xl sm:text-3xl font-normal text-gray-800 uppercase tracking-wide truncate pr-2">{topic.title}</h2>
                    {canEdit && (
                        <div className="flex gap-2 shrink-0">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                        <MoreVertical className="h-5 w-5 text-gray-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openCreateItemDialog(topic.id, 'task')}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Task
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openCreateItemDialog(topic.id, 'material')}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Material
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => openEditTopicDialog(topic)}>
                                        <Pencil className="w-4 h-4 mr-2" /> Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => requestConfirm('Delete topic', 'Are you sure you want to delete this topic?', () => handleDeleteTopic(topic.id))} className="text-red-600 focus:text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
                
                {/* Items List */}
                <div className="space-y-0">
                    {topic.items.length === 0 ? (
                        <div className="text-sm text-gray-500 italic p-4">No items in this topic yet.</div>
                    ) : (
                        topic.items.map((item) => {
                            const isExpanded = expandedItems.has(item.id);
                            return (
                                <div 
                                    key={item.id} 
                                    className={cn(
                                        "group border-b border-gray-200 last:border-0 transition-all duration-200",
                                        isExpanded ? "bg-white shadow-md rounded-lg my-4 border-0" : "hover:bg-gray-50 cursor-pointer"
                                    )}
                                >
                                    {/* Item Row */}
                                    <div 
                                        className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4"
                                        onClick={() => toggleItemExpansion(item.id)}
                                    >
                                        <div className={cn(
                                            "p-2 sm:p-2.5 rounded-full flex items-center justify-center shrink-0 transition-colors bg-gray-300 text-white mt-0.5 sm:mt-0"
                                        )}>
                                            {item.type === 'task' ? <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" /> : <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                            <h3 className={cn("text-sm font-medium truncate text-gray-900 flex-1")}>
                                                {item.title}
                                            </h3>
                                            <div className="text-xs text-gray-500 whitespace-nowrap sm:text-right">
                                                {item.type === 'task' && item.dueDate ? item.dueDate : item.postedAt}
                                            </div>
                                        </div>
                                        {canEdit && (
                                            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="w-4 h-4 text-gray-500" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditItemDialog(topic.id, item)}>
                                                            <Pencil className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => requestConfirm('Delete item', 'Are you sure you want to delete this item?', () => handleDeleteItem(topic.id, item.id))} className="text-red-600 focus:text-red-600">
                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 pl-4 sm:pl-[4.5rem]">
                                            <div className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">
                                                {item.description || "No description."}
                                            </div>
                                            
                                            {/* Attachments Display */}
                                            {item.attachments && item.attachments.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                                    {item.attachments.map(att => (
                                                        <div key={att.id} className="flex items-center gap-3 p-2 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                                                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0 text-gray-500">
                                                                {att.type === 'link' ? <LinkIcon className="w-5 h-5" /> : 
                                                                 att.type === 'image' ? <div className="w-full h-full overflow-hidden rounded"><img src={att.url} className="w-full h-full object-cover" /></div> : 
                                                                 <FileIcon className="w-5 h-5" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-blue-600 truncate">{att.name || "Attachment"}</div>
                                                                <div className="text-xs text-gray-500 uppercase">{att.type}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="border-t border-gray-100 pt-3 flex justify-start">
                                                <Button variant="link" className="p-0 h-auto text-sm text-gray-600 hover:text-blue-600">
                                                    {item.type === 'task' ? 'View instructions' : 'View material'}
                                                </Button>
                                            </div>
                                            <ConfirmDialog
                                                open={confirmOpen}
                                                onOpenChange={setConfirmOpen}
                                                title={confirmTitle}
                                                description={confirmDescription}
                                                confirmLabel="Delete"
                                                cancelLabel="Cancel"
                                                onConfirm={async () => {
                                                    if (confirmAction) await confirmAction()
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* Create/Edit Topic Dialog */}
      <Dialog open={isCreateTopicOpen} onOpenChange={closeTopicDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTopicId ? 'Rename Topic' : 'Create Topic'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="topic-title">Topic Title</Label>
              <Input 
                id="topic-title" 
                placeholder="e.g., Week 2" 
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') handleCreateOrUpdateTopic(); }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeTopicDialog}>Cancel</Button>
            <Button onClick={handleCreateOrUpdateTopic} disabled={!topicTitle.trim()}>{editingTopicId ? 'Rename' : 'Add Topic'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Item Dialog */}
      <CreateClassworkItemDialog 
        open={isCreateItemOpen} 
        onOpenChange={setIsCreateItemOpen}
        type={activeItemType}
        initialData={itemInitialData}
        onCreate={handleCreateOrUpdateItem}
      />
    </div>
  );
}
