import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Home, MapPin, Calendar, DollarSign } from "lucide-react";

export default async function PropertiesPage() {
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

  // Get properties
  let query = supabase.from("properties").select(`
      *,
      client:profiles!properties_client_id_fkey(full_name, email)
    `);

  if (profile!.role === "client") {
    query = query.eq("client_id", user.id);
  }

  const { data: properties } = await query;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Properties</h1>
              <p className="text-muted-foreground mt-1">
                {profile!.role === "admin"
                  ? "Manage all properties"
                  : "Your property information"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!properties || properties.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No properties found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {properties.map((property: any) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        {property.address}
                      </CardTitle>
                      {profile.role === "admin" && property.client && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Client: {property.client.full_name || property.client.email}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={property.status === "active" ? "success" : "default"}
                    >
                      {property.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {property.square_footage && (
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Size</p>
                          <p className="text-sm font-medium">
                            {property.square_footage.toLocaleString()} sq ft
                          </p>
                        </div>
                      </div>
                    )}
                    {property.year_built && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Built</p>
                          <p className="text-sm font-medium">{property.year_built}</p>
                        </div>
                      </div>
                    )}
                    {property.monthly_retainer && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Monthly Retainer
                          </p>
                          <p className="text-sm font-medium">
                            {formatCurrency(property.monthly_retainer)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {property.systems && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Systems</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(property.systems).map((system) => (
                          <Badge key={system} variant="outline">
                            {system.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {property.access_instructions && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium mb-1">Access Instructions</p>
                      <p className="text-sm text-muted-foreground">
                        {property.access_instructions}
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
