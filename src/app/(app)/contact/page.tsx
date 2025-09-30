"use client";

import { useMutation } from "convex/react";
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
import { Textarea } from "@/components/ui/textarea";
import { api } from "../../../../convex/_generated/api"; // Ajusta la ruta si es necesario

export default function ContactPage() {
  const [form, setForm] = useState({
    email: "",
    source_url: "",
    additional_info: "",
    image_url: "",
    source_type: "newsletter",
    form_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mutation Convex para crear contacto
  const createContact = useMutation(api.mutations.contact.createContact);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (value: string) => {
    setForm({ ...form, source_type: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      await createContact({
        form_id: form.form_id,
        email: form.email,
        source_url: form.source_url || undefined,
        additional_info: form.additional_info || undefined,
        image_url: form.image_url || undefined,
        source_type: form.source_type,
        status: "new",
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      setSuccess(true);
      setForm({
        email: "",
        source_url: "",
        additional_info: "",
        image_url: "",
        source_type: "newsletter",
        form_id: "",
      });
    } catch (err: any) {
      setError(err.message || "Error al enviar el contacto");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center ">
      <form className="w-full max-w-md space-y-6 p-6" onSubmit={handleSubmit}>
        <div>
          <Label className="pb-2" htmlFor="form_id">
            ID del formulario
          </Label>
          <Input
            id="form_id"
            name="form_id"
            type="text"
            placeholder="ID del formulario"
            value={form.form_id}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label className="pb-2" htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label className="pb-2" htmlFor="source_url">
            URL de origen
          </Label>
          <Input
            id="source_url"
            name="source_url"
            type="url"
            placeholder="https://ejemplo.com"
            value={form.source_url}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label className="pb-2" htmlFor="additional_info">
            Información adicional
          </Label>
          <Textarea
            id="additional_info"
            name="additional_info"
            placeholder="Escribe información relevante..."
            value={form.additional_info}
            onChange={handleChange}
            rows={3}
          />
        </div>
        <div>
          <Label className="pb-2" htmlFor="image_url">
            URL de imagen
          </Label>
          <Input
            id="image_url"
            name="image_url"
            type="url"
            placeholder="https://imagen.com/foto.jpg"
            value={form.image_url}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label className="pb-2" htmlFor="source_type">
            Tipo de origen
          </Label>
          <Select value={form.source_type} onValueChange={handleSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="demo">Demo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Enviando..." : "Enviar"}
        </Button>
        {success && (
          <p className="text-green-600 text-center mt-2">
            ¡Contacto enviado correctamente!
          </p>
        )}
        {error && <p className="text-red-600 text-center mt-2">{error}</p>}
      </form>
    </div>
  );
}
