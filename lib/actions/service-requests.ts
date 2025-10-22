"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ServiceCategory, ServicePriority } from "@/lib/types/database";

export async function createServiceRequest(formData: {
  property_id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  priority: ServicePriority;
  client_notes?: string;
  photos?: string[];
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await (supabase
    .from("service_requests")
    .insert as any)({
      ...formData,
      status: "submitted",
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/requests");
  revalidatePath("/dashboard");
  return { data };
}

export async function updateServiceRequest(
  id: string,
  updates: {
    status?: string;
    assigned_vendor_id?: string;
    estimated_cost?: number;
    actual_cost?: number;
    admin_notes?: string;
    scheduled_at?: string;
    completed_at?: string;
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if user is admin
  const { data: profile }: { data: any } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const { data, error } = await (supabase
    .from("service_requests")
    .update as any)(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/requests");
  revalidatePath("/dashboard");
  return { data };
}

export async function deleteServiceRequest(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if user is admin
  const { data: profile }: { data: any } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.from("service_requests").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/requests");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function uploadServicePhoto(file: File, propertyId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${propertyId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("service-photos")
    .upload(fileName, file);

  if (error) {
    return { error: error.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("service-photos").getPublicUrl(fileName);

  return { data: { path: fileName, url: publicUrl } };
}
