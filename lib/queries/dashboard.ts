import { createClient } from "@/lib/supabase/server";
import { Profile, Property } from "@/lib/types/database";

type DashboardData = {
  profile: Profile;
  properties: any[];
  serviceRequests: any[];
  maintenance: any[];
  stats: {
    activeRequests: number;
    totalProperties: number;
  };
};

export async function getDashboardData(userId: string): Promise<DashboardData | null> {
  const supabase = await createClient();

  // Get user profile
  const { data: profile }: { data: any } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    return null;
  }

  // For clients, get their properties
  const { data: properties }: { data: any } = await supabase
    .from("properties")
    .select("*")
    .eq(profile!.role === "client" ? "client_id" : "id", profile!.role === "client" ? userId : "")
    .eq("status", "active");

  // Get service requests
  const propertyIds = properties?.map((p: any) => p.id) || [];
  let serviceRequestsQuery = supabase
    .from("service_requests")
    .select(`
      *,
      property:properties(address),
      vendor:vendors(company_name)
    `)
    .order("requested_at", { ascending: false });

  if (profile!.role === "client" && propertyIds.length > 0) {
    serviceRequestsQuery = serviceRequestsQuery.in("property_id", propertyIds);
  }

  const { data: serviceRequests } = await serviceRequestsQuery.limit(10);

  // Get upcoming maintenance
  let maintenanceQuery = supabase
    .from("maintenance_schedules")
    .select(`
      *,
      property:properties(address),
      vendor:vendors(company_name)
    `)
    .gte("next_due", new Date().toISOString().split("T")[0])
    .order("next_due", { ascending: true });

  if (profile!.role === "client" && propertyIds.length > 0) {
    maintenanceQuery = maintenanceQuery.in("property_id", propertyIds);
  }

  const { data: maintenance } = await maintenanceQuery.limit(5);

  // Get active service requests count
  const { count: activeRequests } = await supabase
    .from("service_requests")
    .select("*", { count: "exact", head: true })
    .in("property_id", propertyIds)
    .in("status", ["submitted", "assigned", "in_progress"]);

  return {
    profile,
    properties: properties || [],
    serviceRequests: serviceRequests || [],
    maintenance: maintenance || [],
    stats: {
      activeRequests: activeRequests || 0,
      totalProperties: properties?.length || 0,
    },
  };
}
