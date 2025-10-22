"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createServiceRequest } from "@/lib/actions/service-requests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@/lib/types/database";

const serviceRequestSchema = z.object({
  property_id: z.string().min(1, "Please select a property"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.enum(["hvac", "plumbing", "electrical", "landscape", "pool", "general"]),
  priority: z.enum(["routine", "urgent", "emergency"]),
  client_notes: z.string().optional(),
});

type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;

interface NewServiceRequestFormProps {
  properties: Property[];
}

export function NewServiceRequestForm({ properties }: NewServiceRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestSchema),
  });

  const selectedCategory = watch("category");
  const selectedPriority = watch("priority");

  const onSubmit = async (data: ServiceRequestForm) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createServiceRequest({
        ...data,
        description: data.description || "",
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/requests");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="property_id">Property *</Label>
            <Select
              onValueChange={(value) => setValue("property_id", value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.property_id && (
              <p className="text-sm text-destructive mt-1">
                {errors.property_id.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              onValueChange={(value: any) => setValue("category", value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hvac">❄️ HVAC</SelectItem>
                <SelectItem value="plumbing">🚰 Plumbing</SelectItem>
                <SelectItem value="electrical">⚡ Electrical</SelectItem>
                <SelectItem value="landscape">🌳 Landscape</SelectItem>
                <SelectItem value="pool">🏊 Pool</SelectItem>
                <SelectItem value="general">🔧 General</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="priority">Priority *</Label>
            <Select
              onValueChange={(value: any) => setValue("priority", value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">
                  <div>
                    <div className="font-medium">Routine</div>
                    <div className="text-xs text-muted-foreground">
                      Standard maintenance, no rush
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="urgent">
                  <div>
                    <div className="font-medium">Urgent</div>
                    <div className="text-xs text-muted-foreground">
                      Needs attention within 24-48 hours
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="emergency">
                  <div>
                    <div className="font-medium">Emergency</div>
                    <div className="text-xs text-muted-foreground">
                      Immediate attention required
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.priority && (
              <p className="text-sm text-destructive mt-1">
                {errors.priority.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Brief description of the issue"
              disabled={loading}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Provide detailed information about the service request..."
              rows={4}
              disabled={loading}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="client_notes">Additional Notes</Label>
            <Textarea
              id="client_notes"
              {...register("client_notes")}
              placeholder="Any additional information or special instructions..."
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );
}
