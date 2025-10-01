"use client";
import { useQuery } from "convex/react";
import { CreateFormDialog } from "@/components/create-form";
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

export default function FormsPage() {
  const forms = useQuery(api.queries.forms.getFormsByUser);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b">
        <div className="max-w-7xl mx-auto space-y-2">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
              <p className="text-muted-foreground mt-1">
                Manage your forms and create new ones.
              </p>
            </div>
            <CreateFormDialog />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {forms === undefined ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">Loading forms...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">
                You have no forms yet
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Created At</TableHead>
                    <TableHead className="font-semibold text-right">
                      Form ID
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow key={form._id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{form.name}</TableCell>
                      <TableCell className="max-w-md truncate">
                        {form.description || (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(form.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {form._id}
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
