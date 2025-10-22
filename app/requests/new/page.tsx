import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewServiceRequestForm } from "@/components/forms/new-service-request-form";

export default async function NewServiceRequestPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user's properties
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("client_id", user.id)
    .eq("status", "active");

  if (!properties || properties.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">No Properties Found</h2>
          <p className="text-muted-foreground mb-6">
            You need to have at least one property to create a service request.
            Please contact your administrator to add a property to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">New Service Request</h1>
          <p className="text-muted-foreground mt-1">
            Submit a new service request for your property
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewServiceRequestForm properties={properties} />
      </div>
    </div>
  );
}
