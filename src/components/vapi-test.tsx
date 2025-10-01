"use client";
import Vapi from "@vapi-ai/web";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface VapiWidgetProps {
  publicKey: string;
  assistantId: string;
}

interface ContactData {
  form_id: string;
  email: string;
  source_url: string;
  additional_info: string;
  image_url: string;
  source_type: string;
  status: string;
  created_at: number;
  updated_at: number;
}

const VapiWidget: React.FC<VapiWidgetProps> = ({ publicKey, assistantId }) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [collectedData, setCollectedData] = useState({
    email: "",
    additional_info: "",
  });

  useEffect(() => {
    const vapiInstance = new Vapi(publicKey);
    setVapi(vapiInstance);

    vapiInstance.on("call-start", () => setIsConnected(true));
    vapiInstance.on("call-end", async () => {
      setIsConnected(false);
      if (collectedData.email || collectedData.additional_info) {
        await submitContact();
      }
    });
    vapiInstance.on("message", (message) => {
      if (message.content) {
        const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
        const foundEmail = message.content.match(emailRegex);
        if (foundEmail) {
          setCollectedData((prev) => ({
            ...prev,
            email: foundEmail[0],
          }));
        }
        setCollectedData((prev) => ({
          ...prev,
          additional_info: prev.additional_info
            ? `${prev.additional_info}\n${message.content}`
            : message.content,
        }));
      }
    });

    return () => {
      vapiInstance?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  const submitContact = async () => {
    const contactData: ContactData = {
      form_id: "jd76dtqjd05rdyj5j556btdce57rgy1q",
      email: collectedData.email,
      source_url: "https://www.uprizing.me/",
      additional_info: collectedData.additional_info,
      image_url: "",
      source_type: "demo",
      status: "new",
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    try {
      await fetch(
        "https://successful-crocodile-873.convex.site/create-contact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactData),
        },
      );
      setCollectedData({ email: "", additional_info: "" });
    } catch {}
  };

  const startCall = () => vapi?.start(assistantId);
  const endCall = () => vapi?.stop();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-xs shadow-none border-none bg-transparent">
        <CardContent className="flex flex-col items-center gap-4 p-0">
          <Button
            onClick={isConnected ? endCall : startCall}
            className="w-full"
            variant="default"
          >
            {isConnected ? "End Call" : "🎤 Start Assistant"}
          </Button>
          <div className="text-xs text-muted-foreground text-center min-h-4">
            {collectedData.email && <div>Email: {collectedData.email}</div>}
            {collectedData.additional_info && !collectedData.email && (
              <div>Listening...</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VapiWidget;
