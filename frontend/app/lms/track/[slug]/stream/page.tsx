"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackService } from "@/services/trackService";
import { useFetch } from "@/hooks/useFetch";
import {
  MessageSquare,
  MoreVertical,
  FileText,
  Info,
  Eye,
  Trash2,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Loader from "@/components/Loader";
import AnnouncementInput from "./announcement-input";
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
} from "@/components/ui/dialog";

interface StreamItem {
  id: string;
  type: "assignment" | "announcement";
  author: string;
  title: string;
  date: string;
  content?: string;
}

export default function StreamPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: track, loading } = useFetch(() =>
    trackService.getTrackByTrackId(slug)
  );

  const [streamItems, setStreamItems] = useState<StreamItem[]>([
    {
      id: "1",
      type: "assignment",
      author: "Uptick Talent",
      title: "WEEK 8 TASK",
      date: "11 Aug (Edited 18 Aug)",
      content: "Please complete the Week 8 task by the deadline.",
    },
    {
      id: "2",
      type: "assignment",
      author: "Uptick Talent",
      title: "WEEK 7 TASK",
      date: "4 Aug",
      content: "Week 7 task details are attached.",
    },
    {
      id: "3",
      type: "announcement",
      author: "Instructor",
      title: "New Announcement",
      date: "2 days ago",
      content:
        "Welcome to the course! Please make sure to review the syllabus and join the Slack channel.",
    },
  ]);

  const [viewingItem, setViewingItem] = useState<StreamItem | null>(null);

  const handleDelete = (id: string) => {
    setStreamItems(streamItems.filter((item) => item.id !== id));
  };

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState<
    string | undefined
  >(undefined);
  const [confirmAction, setConfirmAction] = useState<
    (() => void | Promise<void>) | null
  >(null);

  const requestConfirm = (
    title: string,
    description: string | undefined,
    action: () => void | Promise<void>
  ) => {
    setConfirmTitle(title);
    setConfirmDescription(description);
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };

  if (loading) return <Loader />;
  if (!track) return null;

  return (
    <div className=" space-y-6">
      {/* Banner */}
      <div className="relative space-y-6 mt-6 w-full h-60 rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-blue-400 text-white p-8 flex flex-col justify-end">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">{track.name}</h1>
          <p className="text-xl opacity-90">
            Uptick Talent Engineering Fellowship
          </p>
        </div>
        {/* Decorative Circle/Graphic Placeholder */}
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
          <div className="w-96 h-96 rounded-full bg-white"></div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-4 text-white hover:bg-white/20 rounded-full"
        >
          <Info className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Upcoming */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Woohoo, no work due in soon!
              </p>
              <div className="flex justify-end">
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm text-blue-600 font-medium"
                >
                  View all
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stream Feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Announcement Input */}
          <AnnouncementInput trackName={track.name} />

          {/* Stream Items */}
          <div className="space-y-4">
            {streamItems.map((item) => (
              <Card
                key={item.id}
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                  <div
                    className="flex items-center gap-4"
                    onClick={() => setViewingItem(item)}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === "assignment"
                          ? "bg-blue-600 text-white"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {item.type === "assignment" ? (
                        <FileText className="w-5 h-5" />
                      ) : (
                        <MessageSquare className="w-5 h-5" />
                      )}
                    </div>
                    <ConfirmDialog
                      open={confirmOpen}
                      onOpenChange={setConfirmOpen}
                      title={confirmTitle}
                      description={confirmDescription}
                      confirmLabel="Delete"
                      cancelLabel="Cancel"
                      onConfirm={async () => {
                        if (confirmAction) await confirmAction();
                      }}
                    />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        <span className="font-semibold">{item.author}</span>{" "}
                        posted a new {item.type}:{" "}
                        <span className="font-semibold">{item.title}</span>
                      </h3>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
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
                        onClick={() =>
                          requestConfirm(
                            "Delete item",
                            "Are you sure you want to delete this item?",
                            () => handleDelete(item.id)
                          )
                        }
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                {item.type === "announcement" && (
                  <CardContent className="pt-0 pb-4 px-4 ml-14">
                    <p className="text-sm text-gray-700">{item.content}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* View Item Dialog */}
      <Dialog
        open={!!viewingItem}
        onOpenChange={(open) => !open && setViewingItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingItem?.type === "assignment" ? (
                <FileText className="w-5 h-5 text-blue-600" />
              ) : (
                <MessageSquare className="w-5 h-5 text-purple-600" />
              )}
              {viewingItem?.title}
            </DialogTitle>
            <DialogDescription>
              Posted by {viewingItem?.author} on {viewingItem?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 whitespace-pre-wrap">
              {viewingItem?.content || "No content available."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
