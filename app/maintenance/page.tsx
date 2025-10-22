import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import { Calendar, Wrench, CheckCircle, AlertCircle } from "lucide-react";

export default async function MaintenancePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile }: { data: any } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/login");
  }

  // Get maintenance schedules
  let query = supabase
    .from("maintenance_schedules")
    .select(
      `
      *,
      property:properties(address, client_id),
      vendor:vendors(company_name)
    `
    )
    .order("next_due", { ascending: true });

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

  const { data: schedules }: { data: any } = await query;

  const today = new Date().toISOString().split("T")[0];
  const upcoming = schedules?.filter((s: any) => s.next_due >= today) || [];
  const overdue = schedules?.filter((s: any) => s.next_due < today) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Maintenance Schedule</h1>
              <p className="text-muted-foreground mt-1">
                {profile!.role === "admin"
                  ? "Manage all maintenance schedules"
                  : "Your property maintenance calendar"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Scheduled</p>
                  <p className="text-2xl font-bold">{schedules?.length || 0}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{upcoming.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    {overdue.length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Automated</p>
                  <p className="text-2xl font-bold">
                    {schedules?.filter((s: any) => s.automation_enabled).length || 0}
                  </p>
                </div>
                <Wrench className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Items */}
        {overdue.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Overdue Maintenance
            </h2>
            <div className="grid lg:grid-cols-2 gap-4">
              {overdue.map((schedule: any) => (
                <Card
                  key={schedule.id}
                  className="border-red-200 bg-red-50/50 dark:bg-red-950/20"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {schedule.service_type}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {schedule.property?.address}
                        </p>
                        {schedule.vendor && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {schedule.vendor.company_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">Overdue</Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          Due: {formatDateShort(schedule.next_due)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Maintenance */}
        <div>
          <h2 className="text-xl font-bold mb-4">Upcoming Maintenance</h2>
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No upcoming maintenance scheduled
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-2 gap-4">
              {upcoming.map((schedule: any) => (
                <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{schedule.service_type}</h3>
                          {schedule.automation_enabled && (
                            <Badge variant="outline" className="text-xs">
                              Auto
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {schedule.property?.address}
                        </p>
                        {schedule.vendor && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {schedule.vendor.company_name}
                          </p>
                        )}
                        {schedule.last_completed && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Last completed: {formatDateShort(schedule.last_completed)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{schedule.frequency}</Badge>
                        <p className="text-sm font-medium mt-2">
                          {formatDateShort(schedule.next_due)}
                        </p>
                      </div>
                    </div>
                    {schedule.notes && (
                      <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
                        {schedule.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
