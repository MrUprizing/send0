"use client";
import { IconMailAi } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SOURCE_TYPE_OPTIONS = [
  { value: "newsletter", label: "Newsletter" },
  { value: "sales", label: "Sales" },
  { value: "demo", label: "Demo" },
];

export default function CreateContactForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const formId = searchParams.get("formid") || "";

  const [email, setEmail] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sourceType, setSourceType] = useState("demo");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const now = Date.now();

    const payload = {
      form_id: formId,
      email,
      source_url: sourceUrl,
      additional_info: additionalInfo,
      image_url: imageUrl,
      source_type: sourceType,
      status: "new",
      created_at: now,
      updated_at: now,
    };

    const res = await fetch(
      "https://successful-crocodile-873.convex.site/create-contact",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setEmail("");
      setSourceUrl("");
      setAdditionalInfo("");
      setImageUrl("");
      setSourceType("demo");
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Error creating contact");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md">
              <IconMailAi className="size-12" />
            </div>
            <h1 className="text-xl font-bold">New Contact</h1>
            <div className="text-center text-sm">
              Fill out the form to create a new contact.
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="source_url">Source URL</Label>
              <Input
                id="source_url"
                type="url"
                placeholder="https://example.com"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="additional_info">Additional Info</Label>
              <Input
                id="additional_info"
                type="text"
                placeholder="Relevant information"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="source_type">Source Type</Label>
              <Select
                value={sourceType}
                onValueChange={setSourceType}
                name="source_type"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Create Contact"}
            </Button>
            {success && (
              <div className="text-green-600 text-center text-sm">
                Contact created successfully!
              </div>
            )}
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        by <a href="https://www.uprizing.me/">MrUprizing</a>
      </div>
    </div>
  );
}
