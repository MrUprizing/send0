"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "../../../../convex/_generated/api";

export default function EmailsPage() {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const userId = currentUser?._id;

  const { results, status, loadMore } = usePaginatedQuery(
    api.queries.mail.listEmails,
    userId ? { userId } : "skip",
    { initialNumItems: 10 }
  );

  const [selectedEmailContent, setSelectedEmailContent] = useState<string | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewEmail = (htmlContent: string) => {
    setSelectedEmailContent(htmlContent);
    setIsDialogOpen(true);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-muted-foreground">
          Please log in to view your emails
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      draft: "text-gray-700 dark:text-gray-400",
      generating: "text-blue-700 dark:text-blue-400",
      ready: "text-yellow-700 dark:text-yellow-400",
      sent: "text-green-700 dark:text-green-400",
      failed: "text-red-700 dark:text-red-400",
    };

    const statusLabels: Record<string, string> = {
      draft: "Draft",
      generating: "Generating",
      ready: "Ready",
      sent: "Sent",
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
            <h1 className="text-3xl font-bold tracking-tight">Emails</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your generated emails.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {status === "LoadingFirstPage" ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">Loading emails...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">
                You have no emails yet
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">To</TableHead>
                      <TableHead className="font-semibold">Subject</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((email) => (
                      <TableRow key={email._id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {email.to_email}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {email.subject}
                        </TableCell>
                        <TableCell>{getStatusBadge(email.send_status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(email.sent_at || email.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleViewEmail(email.html_content)}
                            variant="outline"
                            size="sm"
                          >
                            View Email
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Load More Button */}
              {status === "CanLoadMore" && (
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={() => loadMore(10)}
                    variant="ghost"
                    className="text-sm"
                    disabled={status !== "CanLoadMore"}
                  >
                    Load more
                  </Button>
                </div>
              )}

              {status === "LoadingMore" && (
                <div className="flex justify-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    Loading more emails...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialog for viewing email content */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedEmailContent && (
              <div className="border rounded-lg p-4 bg-white dark:bg-gray-950">
                <iframe
                  title="Email preview"
                  srcDoc={selectedEmailContent}
                  className="w-full min-h-[500px] border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}