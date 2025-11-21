"use client";

import React, { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import Skeleton from "@/components/ui/skeleton";
import { formatDateTime, formatDate } from "@/utils/formatDate";
import { Mail, Phone, MapPin, User, Calendar, Shield, Key } from "lucide-react";
import Loader from "@/components/Loader";

function Initials({
  firstName,
  lastName,
}: {
  firstName?: string | null;
  lastName?: string | null;
}) {
  const initials = `${firstName?.[0] ?? ""}${
    lastName?.[0] ?? ""
  }`.toUpperCase();
  return (
    <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[#3b82f6] text-xl sm:text-2xl font-bold text-white border-2 border-white/30">
      {initials || <Skeleton className="h-6 w-6 sm:h-8 sm:w-8" />}
      <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[hsl(var(--success))] border-4 border-white"></div>
    </div>
  );
}

export default function ProfilePage() {
  const {
    data: profile,
    loading,
    error,
    refetch,
  } = useFetch(() => authService.getCurrentUser());

  const { refreshUser } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    isActive: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        isActive: profile.isActive ?? true,
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const handleUpdateProfile = async () => {
    if (!profile?._id) return;

    setIsUpdating(true);
    try {
      await userService.updateUser(profile._id, formData);
      toast.success("Profile updated successfully");
      setIsDialogOpen(false);
      refetch();
      refreshUser();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[#3b82f6] bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Profile Header Card */}
        <header className="mb-6 sm:mb-8">
          <div className="overflow-hidden rounded-lg border-2 border-[hsl(var(--primary))]/20 bg-gradient-to-br from-[hsl(var(--primary))] to-[#3b82f6]">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 sm:gap-6">
                  <Initials
                    firstName={profile?.firstName}
                    lastName={profile?.lastName}
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white truncate">
                      {loading ? (
                        <Skeleton className="h-8 w-48 bg-white/20" />
                      ) : (
                        `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`
                      )}
                    </h2>
                    <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      {loading ? (
                        <Skeleton className="h-6 w-24 bg-white/20 rounded-full" />
                      ) : (
                        <Badge className="uppercase w-fit bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
                          <Shield className="w-3 h-3 mr-1" />
                          {profile?.role}
                        </Badge>
                      )}

                      <span className="text-sm text-white/90 flex items-center gap-1">
                        {loading ? (
                          <Skeleton className="h-5 w-32 bg-white/20" />
                        ) : (
                          <>
                            <Calendar className="w-4 h-4" />
                            Member since {formatDate(profile?.createdAt ?? "")}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full sm:w-auto bg-white text-[hsl(var(--primary))] hover:bg-white/90 font-semibold border-2 border-white/50 cursor-pointer transition-all hover:scale-105"
                        size="lg"
                      >
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Make changes to your profile here. Click save when you're done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-4">
                          <Label htmlFor="firstName" className="text-right">
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="col-span-3"
                          />
                        </div>
                        <div className="flex flex-col gap-4">
                          <Label htmlFor="lastName" className="text-right">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="col-span-3"
                          />
                        </div>
                        <div className="flex flex-col gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="col-span-3"
                          />
                        </div>
                        <div className="flex flex-col gap-4">
                          <Label htmlFor="isActive" className="text-right">
                            Active Status
                          </Label>
                          <div className="flex space-x-2">
                            <Switch
                              id="isActive"
                              checked={formData.isActive}
                              onCheckedChange={handleSwitchChange}
                            />
                            <Label htmlFor="isActive">
                              {formData.isActive ? "Active" : "Inactive"}
                            </Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleUpdateProfile} disabled={isUpdating}>
                          {isUpdating ? "Saving..." : "Save changes"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-lg border-2 border-destructive bg-white">
            <div className="p-6 sm:p-8">
              <div className="text-sm text-destructive">
                <p className="font-medium">Error loading profile: {error}</p>
                <div className="mt-4">
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <main className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Contact Information Card */}
            <div className="lg:col-span-1 rounded-lg border-2 border-slate-200 bg-white overflow-hidden">
              <div className="pb-4 px-6 pt-6 bg-gradient-to-br from-slate-50 to-blue-50/50">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-[hsl(var(--primary))]" />
                  Contact Information
                </h3>
              </div>
              <div className="space-y-5 pt-6 px-6 pb-6">
                <div className="group">
                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Email
                  </dt>
                  <dd className="text-sm font-medium text-foreground truncate bg-slate-50 px-3 py-2 rounded-lg">
                    {loading ? (
                      <Skeleton className="h-5 w-full" />
                    ) : (
                      profile?.email
                    )}
                  </dd>
                </div>
                <div className="group">
                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Phone
                  </dt>
                  <dd className="text-sm font-medium text-foreground bg-slate-50 px-3 py-2 rounded-lg">
                    {loading ? (
                      <Skeleton className="h-5 w-32" />
                    ) : (
                      profile?.phoneNumber || "Not provided"
                    )}
                  </dd>
                </div>
                <div className="group">
                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Location
                  </dt>
                  <dd className="text-sm font-medium text-foreground bg-slate-50 px-3 py-2 rounded-lg">
                    {loading ? (
                      <Skeleton className="h-5 w-40" />
                    ) : (
                      `${profile?.state ?? "N/A"}, ${profile?.country ?? "N/A"}`
                    )}
                  </dd>
                </div>
                <div className="group">
                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Gender
                  </dt>
                  <dd className="capitalize text-sm font-medium text-foreground bg-slate-50 px-3 py-2 rounded-lg">
                    {loading ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      profile?.gender || "Not specified"
                    )}
                  </dd>
                </div>
              </div>
            </div>

            {/* Activity Card */}
            <div className="lg:col-span-2 rounded-lg border-2 border-slate-200 bg-white overflow-hidden">
              <div className="pb-4 px-6 pt-6 bg-gradient-to-br from-slate-50 to-blue-50/50">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[hsl(var(--primary))]" />
                  Activity & Security
                </h3>
              </div>
              <div className="pt-6 px-6 pb-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                  <div className="rounded-lg border-2 border-slate-200 bg-white">
                    <div className="p-5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[hsl(var(--primary))]" />
                        Last Login
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {loading ? (
                          <Skeleton className="h-5 w-40" />
                        ) : (
                          formatDateTime(profile?.lastLogin ?? "")
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border-2 border-slate-200 bg-white">
                    <div className="p-5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                        <Key className="w-4 h-4 text-[hsl(var(--success))]" />
                        Password Status
                      </p>
                      <div className="mt-2">
                        {loading ? (
                          <Skeleton className="h-6 w-32" />
                        ) : profile?.isPasswordDefault ? (
                          <Badge className="bg-[hsl(var(--danger))] text-white hover:bg-[hsl(var(--danger))]/90 font-semibold">
                            Using default password
                          </Badge>
                        ) : (
                          <Badge className="bg-[hsl(var(--success))] text-white hover:bg-[hsl(var(--success))]/90 font-semibold">
                            Password updated
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[hsl(var(--primary))]" />
                    Account ID
                  </h3>
                  <div className="rounded-lg bg-slate-50 border-2 border-slate-200">
                    <div className="p-4">
                      <pre className="rounded-lg bg-white border border-slate-200 p-4 text-xs text-foreground overflow-auto max-h-24 font-mono">
                        {loading ? (
                          <Skeleton className="h-4 w-full" />
                        ) : (
                          profile?._id
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
