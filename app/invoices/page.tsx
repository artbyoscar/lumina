import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { FileText, Calendar, DollarSign, CheckCircle } from "lucide-react";

export default async function InvoicesPage() {
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

  // Get invoices
  let query = supabase
    .from("invoices")
    .select(
      `
      *,
      property:properties(address, client_id)
    `
    )
    .order("invoice_date", { ascending: false });

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

  const { data: invoices }: { data: any } = await query;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "sent":
        return "info";
      case "overdue":
        return "destructive";
      default:
        return "default";
    }
  };

  const totalRevenue = invoices?.reduce((acc: number, inv: any) => acc + Number(inv.total_amount), 0) || 0;
  const paidInvoices = invoices?.filter((inv: any) => inv.status === "paid").length || 0;
  const overdueInvoices = invoices?.filter((inv: any) => inv.status === "overdue").length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Invoices</h1>
              <p className="text-muted-foreground mt-1">
                {profile.role === "admin"
                  ? "Manage all invoices"
                  : "View your invoices and payment history"}
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
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{invoices?.length || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold">{paidInvoices}</p>
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
                  <p className="text-2xl font-bold">{overdueInvoices}</p>
                </div>
                <Calendar className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        {!invoices || invoices.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No invoices found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice: any) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {invoice.invoice_number}
                        </h3>
                        <Badge variant={getStatusColor(invoice.status) as any}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.property?.address}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>
                          Issued: {formatDateShort(invoice.invoice_date)}
                        </span>
                        <span>Due: {formatDateShort(invoice.due_date)}</span>
                        {invoice.paid_at && (
                          <span>Paid: {formatDateShort(invoice.paid_at)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {formatCurrency(invoice.total_amount)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Subtotal: {formatCurrency(invoice.subtotal)}
                      </p>
                      {invoice.markup_percentage > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{invoice.markup_percentage}% markup
                        </p>
                      )}
                    </div>
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
