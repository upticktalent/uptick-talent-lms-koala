"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { lmsService } from "@/services/lmsService";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/utils/formatDate";
import { ArrowLeft, Calendar, Users, BookOpen, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function CohortDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    data: cohortData,
    loading,
    error,
    refetch,
  } = useFetch(() => lmsService.getCohortById(id));
 

  const cohort = cohortData;

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;
  if (!cohort) return <div className="text-center">Cohort not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className='flex items-center justify-between gap-3'>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{cohort.name}</h1>
            </div>
            <Badge
                variant="secondary"
                className={
                  cohort.status === 'active'
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : cohort.status === 'upcoming'
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                }
              >
                {cohort.status ? cohort.status.charAt(0).toUpperCase() + cohort.status.slice(1) : "Unknown"}
              </Badge>
          </div>
        </div>
           
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cohort.currentStudents} / {cohort.maxStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(cohort.startDate)}
            </div>
            <p className="text-xs text-muted-foreground">
              to {formatDate(cohort.endDate)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cohort.tracks?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Associated tracks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {cohort.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tracks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {cohort.tracks?.map((track: any) => (
                  <Badge key={track._id} variant="outline">
                    {track.name}
                  </Badge>
                )) || <p className="text-sm text-muted-foreground">No tracks assigned.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Student list will be displayed here.</p>
              {/* TODO: Implement student list table */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum">
           <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Curriculum details will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
