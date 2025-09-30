"use client";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

interface EmailComposerProps {
  contactId: Id<"contacts">;
  userId: string;
}

export default function EmailComposer({
  contactId,
  userId,
}: EmailComposerProps) {
  const [userPrompt, setUserPrompt] = useState("");
  const [currentMailId, setCurrentMailId] = useState<Id<"mails"> | null>(null);

  const generateEmail = useMutation(api.actions.email.generateEmail);
  const sendEmail = useMutation(api.actions.emailsender.sendEmail);

  const mail = useQuery(
    api.queries.mail.getMail,
    currentMailId ? { mailId: currentMailId } : "skip",
  );

  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      toast({
        title: "Error",
        description: "Por favor, escribe sobre qué va el correo",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await generateEmail({
        contactId,
        userPrompt,
        userId,
      });

      setCurrentMailId(result.mailId);

      toast({
        title: "Generando email",
        description: "La IA está creando tu email personalizado...",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el email",
        variant: "destructive",
      });
    }
  };

  const handleSend = async () => {
    if (!currentMailId || mail?.send_status !== "ready") {
      toast({
        title: "Error",
        description: "El email no está listo para enviar",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendEmail({ mailId: currentMailId });

      toast({
        title: "Email enviado",
        description: "El email se está enviando en este momento",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Componer Email</CardTitle>
          <CardDescription>
            Escribe sobre qué va el email y la IA lo generará por ti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">¿De qué va el correo?</Label>
            <Textarea
              id="prompt"
              placeholder="Ej: Quiero presentar nuestro nuevo producto SaaS que ayuda a automatizar el envío de emails personalizados..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleGenerate} disabled={!userPrompt.trim()}>
            Generar Email con IA
          </Button>
        </CardContent>
      </Card>

      {mail && (
        <Card>
          <CardHeader>
            <CardTitle>
              {mail.send_status === "generating" && "Generando..."}
              {mail.send_status === "ready" && "Email Generado"}
              {mail.send_status === "sent" && "Email Enviado"}
              {mail.send_status === "failed" && "Error"}
            </CardTitle>
            <CardDescription>
              {mail.send_status === "generating" &&
                "La IA está creando tu email personalizado"}
              {mail.send_status === "ready" &&
                "Revisa el email antes de enviarlo"}
              {mail.send_status === "sent" &&
                `Enviado el ${new Date(mail.sent_at!).toLocaleString()}`}
              {mail.send_status === "failed" && mail.error_message}
            </CardDescription>
          </CardHeader>

          {mail.send_status === "ready" && (
            <CardContent className="space-y-4">
              <div>
                <Label>De:</Label>
                <p className="text-sm text-muted-foreground">
                  {mail.from_email}
                </p>
              </div>

              <div>
                <Label>Para:</Label>
                <p className="text-sm text-muted-foreground">{mail.to_email}</p>
              </div>

              <div>
                <Label>Asunto:</Label>
                <p className="text-sm font-medium">{mail.subject}</p>
              </div>

              <div>
                <Label>Contenido:</Label>
                <div
                  className="mt-2 border rounded p-4 bg-muted/50"
                  dangerouslySetInnerHTML={{ __html: mail.html_content }}
                />
              </div>
            </CardContent>
          )}

          {mail.send_status === "ready" && (
            <CardFooter>
              <Button onClick={handleSend}>Enviar Email</Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
