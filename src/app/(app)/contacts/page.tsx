"use client";

import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const userId = currentUser?._id;

  const { results, status, loadMore } = usePaginatedQuery(
    api.queries.contacts.listContacts,
    userId ? { userId } : "skip",
    { initialNumItems: 10 }
  );

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-sm text-muted-foreground">Por favor inicia sesión para ver tus contactos</p>
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
      new: "Nuevo",
      processing: "Procesando",
      ready: "Listo",
      contacted: "Contactado",
      responded: "Respondido",
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
      sales: "Ventas",
      demo: "Demo",
    };

    return (
      <span className={`text-sm font-medium ${badges[sourceType]}`}>
        {sourceLabels[sourceType]}
      </span>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Contactos</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona y visualiza todos tus contactos
        </p>
      </div>

      {/* Content */}
      {status === "LoadingFirstPage" ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Cargando contactos...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">No tienes contactos aún</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold">Origen</TableHead>
                  <TableHead className="font-semibold">Fecha</TableHead>
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
                    <TableCell>
                      {getStatusBadge(contact.status)}
                    </TableCell>
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
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(contact.created_at)}
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
                Cargar más
              </Button>
            </div>
          )}

          {status === "LoadingMore" && (
            <div className="flex justify-center pt-2">
              <p className="text-sm text-muted-foreground">
                Cargando más contactos...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
