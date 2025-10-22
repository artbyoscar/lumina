import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import {
  Home,
  AlertCircle,
  Calendar,
  Activity,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const dashboardData = await getDashboardData(user.id);

  if (!dashboardData) {
    redirect("/auth/login");
  }

  const { profile, properties, serviceRequests, maintenance, stats } =
    dashboardData as NonNullable<typeof dashboardData>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "info";
      case "submitted":
        return "warning";
      case "urgent":
      case "emergency":
        return "destructive";
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {profile.full_name || profile.email}
              </h1>
              <p className="text-muted-foreground mt-1">
                {profile.role === "admin"
                  ? "Admin Dashboard"
                  : "Your Estate Overview"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/requests">
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Properties</p>
                  <p className="text-2xl font-bold">{stats.totalProperties}</p>
                </div>
                <Home className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Requests
                  </p>
                  <p className="text-2xl font-bold">{stats.activeRequests}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Upcoming Maintenance
                  </p>
                  <p className="text-2xl font-bold">{maintenance.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Health Score</p>
                  <p className="text-2xl font-bold">92%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Overview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No properties found
                </p>
              ) : (
                <div className="space-y-4">
                  {properties.map((property: any) => (
                    <div
                      key={property.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{property.address}</h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          {property.square_footage && (
                            <span>
                              {property.square_footage.toLocaleString()} sq ft
                            </span>
                          )}
                          {property.year_built && (
                            <span> • Built {property.year_built}</span>
                          )}
                        </div>
                        {property.monthly_retainer && (
                          <div className="text-sm font-medium text-primary mt-2">
                            {formatCurrency(property.monthly_retainer)}/month
                          </div>
                        )}
                      </div>
                      <Badge variant={property.status === "active" ? "success" : "default"}>
                        {property.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Maintenance */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Maintenance</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/maintenance">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {maintenance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No upcoming maintenance scheduled
                </p>
              ) : (
                <div className="space-y-4">
                  {maintenance.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{item.service_type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.property?.address}
                        </p>
                        {item.vendor && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.vendor.company_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">
                          {formatDateShort(item.next_due)}
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {item.frequency}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Service Requests
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/requests">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {serviceRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No service requests yet
              </p>
            ) : (
              <div className="space-y-3">
                {serviceRequests.map((request: any) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{request.title}</h4>
                        <Badge variant={getPriorityColor(request.priority) as any}>
                          {request.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.property?.address}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateShort(request.requested_at)}
                        {request.vendor && ` • ${request.vendor.company_name}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(request.status) as any}>
                        {request.status.replace("_", " ")}
                      </Badge>
                      {request.estimated_cost && (
                        <div className="text-sm text-muted-foreground mt-2">
                          Est. {formatCurrency(request.estimated_cost)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
