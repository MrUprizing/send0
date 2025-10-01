"use client";

import { useAction, usePaginatedQuery, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function ContactPage() {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const userId = currentUser?._id;

  const { results, status, loadMore } = usePaginatedQuery(
    api.queries.contacts.listContacts,
    userId ? { userId } : "skip",
    { initialNumItems: 10 },
  );

  const [selectedContactId, setSelectedContactId] =
    useState<Id<"contacts"> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateEmail = useAction(
    api.actions.generateEmailFromProfile.generateEmailFromProfile,
  );

  const handleOpenDialog = (contactId: Id<"contacts">) => {
    setSelectedContactId(contactId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedContactId(null);
    setUserPrompt("");
    setIsGenerating(false);
  };

  const handleGenerateAndSendEmail = async () => {
    if (!userPrompt.trim() || !selectedContactId || !userId) {
      toast.error("Please enter a message");
      return;
    }

    try {
      setIsGenerating(true);
      await generateEmail({
        contactId: selectedContactId,
        userPrompt: userPrompt.trim(),
        userId,
        sendImmediately: true,
      });

      toast.success("Email generated and sent successfully");
      handleCloseDialog();
    } catch (error) {
      console.error("Error generating email:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al generar el email",
      );
      setIsGenerating(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-muted-foreground">
          Please log in to view your contacts
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      new: "text-blue-700 dark:text-blue-400",
      processing: "text-yellow-700 dark:text-yellow-400",
      ready: "text-green-700 dark:text-green-400",
      contacted: "text-purple-700 dark:text-purple-400",
      responded: "text-pink-700 dark:text-pink-400",
    };

    const statusLabels: Record<string, string> = {
      new: "New",
      processing: "Processing",
      ready: "Ready",
      contacted: "Contacted",
      responded: "Responded",
    };

    return (
      <span className={`text-sm font-medium ${badges[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const getSourceTypeBadge = (sourceType: string) => {
    const badges: Record<string, string> = {
      newsletter: "text-indigo-700 dark:text-indigo-400",
      sales: "text-orange-700 dark:text-orange-400",
      demo: "text-teal-700 dark:text-teal-400",
    };

    const sourceLabels: Record<string, string> = {
      newsletter: "Newsletter",
      sales: "Sales",
      demo: "Demo",
    };

    return (
      <span className={`text-sm font-medium ${badges[sourceType]}`}>
        {sourceLabels[sourceType]}
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
            <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all your contacts.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {status === "LoadingFirstPage" ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">
                Loading contacts...
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">
                You have no contacts yet
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Source</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((contact) => (
                      <TableRow key={contact._id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {contact.email}
                        </TableCell>
                        <TableCell>
                          {getSourceTypeBadge(contact.source_type)}
                        </TableCell>
                        <TableCell>{getStatusBadge(contact.status)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {contact.source_url ? (
                            <a
                              href={contact.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                              {contact.source_url}
                            </a>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(contact.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleOpenDialog(contact._id)}
                            variant="outline"
                            size="sm"
                          >
                            Generate Email
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
                    Loading more contacts...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialog for email generation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Custom Email</DialogTitle>
            <DialogDescription>
              Write the subject or purpose of the email you want to generate.
              The AI will create a personalized email based on the contact's
              profile.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="E.g.: I want to invite them to a demo of our product..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="min-h-32"
              disabled={isGenerating}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateAndSendEmail}
              disabled={isGenerating || !userPrompt.trim()}
            >
              {isGenerating ? "Sending..." : "Generate and Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
