import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Building2, Phone, Mail, Star, Award } from "lucide-react";

export default async function VendorsPage() {
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

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: vendors }: { data: any } = await supabase
    .from("vendors")
    .select("*")
    .order("company_name");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Vendor Directory</h1>
              <p className="text-muted-foreground mt-1">
                Manage approved service vendors
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Vendors</p>
              <p className="text-2xl font-bold">{vendors?.length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">
                {vendors?.filter((v: any) => v.status === "active").length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <p className="text-2xl font-bold">
                {vendors && vendors.length > 0
                  ? (
                      vendors
                        .filter((v: any) => v.performance_rating)
                        .reduce((acc: number, v: any) => acc + (v.performance_rating || 0), 0) /
                      vendors.filter((v: any) => v.performance_rating).length
                    ).toFixed(1)
                  : "N/A"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold">
                {vendors?.reduce((acc: number, v: any) => acc + v.total_jobs_completed, 0) || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Vendors Grid */}
        {!vendors || vendors.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No vendors found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {vendors.map((vendor: any) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        {vendor.company_name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {vendor.contact_name}
                      </p>
                    </div>
                    <Badge
                      variant={vendor.status === "active" ? "success" : "default"}
                    >
                      {vendor.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.phone}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2">
                    {vendor.categories.map((category: string) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    {vendor.performance_rating && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">
                            {vendor.performance_rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Jobs Completed
                      </p>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {vendor.total_jobs_completed}
                        </span>
                      </div>
                    </div>
                  </div>

                  {vendor.hourly_rate && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground">Hourly Rate</p>
                      <p className="text-sm font-medium">
                        {formatCurrency(vendor.hourly_rate)}/hr
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
