"use client";
import Vapi from "@vapi-ai/web";
import { useSearchParams } from "next/navigation";

export default function StartVapiCall() {
  const searchParams = useSearchParams();
  const formId = searchParams.get("formid");

  const handleStart = () => {
    const now = Date.now();
    // Public API Key
    const vapi = new Vapi("cdf40822-cac4-4de4-a505-4017e74ad445");
    vapi.on("error", (error) => {
      console.error("Vapi error:", error);
    });
    vapi.on("call-end", () => {
      console.log("Call ended");
    });
    // Assistant ID
    vapi.start("8b2077fb-1a00-4c0e-8407-242c513fea54", {
      variableValues: {
        form_id: formId,
        image_url: "",
        source_type: "demo",
        status: "new",
        created_at: now,
        updated_at: now,
      },
    });
  };

  return (
    <button type="button" onClick={handleStart}>
      Iniciar Asistente
    </button>
  );
}
