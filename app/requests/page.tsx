import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Plus, Filter } from "lucide-react";
import Link from "next/link";

export default async function ServiceRequestsPage({
  searchParams,
}: {
  searchParams: { status?: string; category?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile }: { data: any } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/login");
  }

  // Build query
  let query = supabase
    .from("service_requests")
    .select(
      `
      *,
      property:properties(id, address, client_id),
      vendor:vendors(id, company_name)
    `
    )
    .order("requested_at", { ascending: false });

  // Filter by client properties if not admin
  if (profile!.role === "client") {
    const { data: properties }: { data: any } = await supabase
      .from("properties")
      .select("id")
      .eq("client_id", user.id);

    const propertyIds = properties?.map((p: any) => p.id) || [];
    if (propertyIds.length > 0) {
      query = query.in("property_id", propertyIds);
    }
  }

  // Apply filters
  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  if (searchParams.category) {
    query = query.eq("category", searchParams.category);
  }

  const { data: requests }: { data: any } = await query;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "info";
      case "assigned":
        return "info";
      case "submitted":
        return "warning";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency":
        return "destructive";
      case "urgent":
        return "warning";
      default:
        return "default";
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      hvac: "❄️",
      plumbing: "🚰",
      electrical: "⚡",
      landscape: "🌳",
      pool: "🏊",
      general: "🔧",
    };
    return icons[category] || "🔧";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Service Requests</h1>
              <p className="text-muted-foreground mt-1">
                {profile!.role === "admin"
                  ? "Manage all service requests"
                  : "View and track your service requests"}
              </p>
            </div>
            <Button asChild>
              <Link href="/requests/new">
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!searchParams.status ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link href="/requests">All</Link>
              </Button>
              {["submitted", "assigned", "in_progress", "completed", "cancelled"].map(
                (status) => (
                  <Button
                    key={status}
                    variant={searchParams.status === status ? "default" : "outline"}
                    size="sm"
                    asChild
                  >
                    <Link href={`/requests?status=${status}`}>
                      {status.replace("_", " ")}
                    </Link>
                  </Button>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          {[
            { status: "submitted", label: "Submitted", color: "text-yellow-600" },
            { status: "assigned", label: "Assigned", color: "text-blue-600" },
            {
              status: "in_progress",
              label: "In Progress",
              color: "text-purple-600",
            },
            { status: "completed", label: "Completed", color: "text-green-600" },
            { status: "cancelled", label: "Cancelled", color: "text-gray-600" },
          ].map((stat) => {
            const count =
              requests?.filter((r: any) => r.status === stat.status).length || 0;
            return (
              <Card key={stat.status}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Requests Grid */}
        {!requests || requests.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  No service requests found
                </p>
                <Button asChild>
                  <Link href="/requests/new">Create Your First Request</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {requests.map((request: any) => (
              <Card
                key={request.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {getCategoryIcon(request.category)}
                        </span>
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getStatusColor(request.status) as any}>
                          {request.status.replace("_", " ")}
                        </Badge>
                        <Badge variant={getPriorityColor(request.priority) as any}>
                          {request.priority}
                        </Badge>
                        <Badge variant="outline">{request.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Property
                      </p>
                      <p className="text-sm">{request.property?.address}</p>
                    </div>

                    {request.description && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Description
                        </p>
                        <p className="text-sm line-clamp-2">
                          {request.description}
                        </p>
                      </div>
                    )}

                    {request.vendor && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Assigned Vendor
                        </p>
                        <p className="text-sm">{request.vendor.company_name}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Requested</p>
                        <p className="text-sm font-medium">
                          {formatDateShort(request.requested_at)}
                        </p>
                      </div>
                      {request.estimated_cost && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {request.actual_cost ? "Actual" : "Estimated"}
                          </p>
                          <p className="text-sm font-medium">
                            {formatCurrency(
                              request.actual_cost || request.estimated_cost
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {profile!.role === "admin" && (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
