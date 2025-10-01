"use client";

import { useQuery } from "convex/react";
import { Contact, FileText, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "../../../../convex/_generated/api";

export default function DashboardPage() {
  const stats = useQuery(api.queries.dashboard.getDashboardStats);
  const aiProfiles = useQuery(api.queries.dashboard.getRecentAiProfiles);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: "text-yellow-700 dark:text-yellow-400",
      completed: "text-green-700 dark:text-green-400",
      failed: "text-red-700 dark:text-red-400",
    };

    const statusLabels: Record<string, string> = {
      pending: "Pending",
      completed: "Completed",
      failed: "Failed",
    };

    return (
      <span className={`text-sm font-medium ${badges[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b">
        <div className="max-w-7xl mx-auto space-y-2">
          <SidebarTrigger className="-ml-1" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your contacts, emails, and forms.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Contacts
                </CardTitle>
                <Contact className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats === undefined ? "..." : stats.totalContacts}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.contactsReady || 0} ready to contact
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Emails Sent
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats === undefined ? "..." : stats.emailsSent}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalEmails || 0} total emails
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Forms
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats === undefined ? "..." : stats.totalForms}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active collection forms
                </p>
              </CardContent>
            </Card>
          </div>

          {/* AI Profiles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              {aiProfiles === undefined ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Loading profiles...
                  </p>
                </div>
              ) : aiProfiles.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No AI profiles yet
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">
                          Industry
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">
                          Created At
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aiProfiles.map((profile) => (
                        <TableRow
                          key={profile._id}
                          className="hover:bg-muted/30"
                        >
                          <TableCell className="font-medium">
                            {profile.contactEmail}
                          </TableCell>
                          <TableCell>
                            {profile.industry || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(profile.processing_status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(profile.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
