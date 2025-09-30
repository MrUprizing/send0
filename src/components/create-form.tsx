"use client";
import { useMutation } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../convex/_generated/api";

export function CreateForm() {
  const createForm = useMutation(api.mutations.form.createForm);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const created_at = Date.now();
      const formId = await createForm({
        name,
        description: description.length > 0 ? description : undefined,
        created_at,
      });
      setSuccess(`Form created! ID: ${formId}`);
      setName("");
      setDescription("");
    } catch (err: any) {
      setError(err.message || "Error creating form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Create a new form</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Form name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Form"}
          </Button>
          {success && <div className="text-green-600 mt-2">{success}</div>}
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      </CardContent>
    </Card>
  );
}
