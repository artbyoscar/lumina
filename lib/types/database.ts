export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "admin" | "client";

export type PropertyStatus = "active" | "inactive";

export type ServiceCategory =
  | "hvac"
  | "plumbing"
  | "electrical"
  | "landscape"
  | "pool"
  | "general";

export type ServicePriority = "routine" | "urgent" | "emergency";

export type ServiceStatus =
  | "submitted"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type MaintenanceFrequency =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "seasonal"
  | "annual";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export type DocumentCategory =
  | "hoa_rules"
  | "warranty"
  | "manual"
  | "permit"
  | "other";

export type VendorStatus = "active" | "inactive";

export type WaitlistStatus = "pending" | "contacted" | "converted";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Property {
  id: string;
  client_id: string;
  address: string;
  square_footage: number | null;
  year_built: number | null;
  systems: Json | null;
  access_instructions: string | null;
  emergency_contacts: Json | null;
  monthly_retainer: number | null;
  status: PropertyStatus;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  property_id: string;
  title: string;
  description: string | null;
  category: ServiceCategory;
  priority: ServicePriority;
  status: ServiceStatus;
  client_notes: string | null;
  admin_notes: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  assigned_vendor_id: string | null;
  requested_at: string;
  scheduled_at: string | null;
  completed_at: string | null;
  photos: string[] | null;
}

export interface Vendor {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  categories: string[];
  hourly_rate: number | null;
  insurance_expiry: string | null;
  performance_rating: number | null;
  total_jobs_completed: number;
  notes: string | null;
  status: VendorStatus;
  created_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  property_id: string;
  service_type: string;
  frequency: MaintenanceFrequency;
  last_completed: string | null;
  next_due: string;
  assigned_vendor_id: string | null;
  automation_enabled: boolean;
  notes: string | null;
}

export interface Invoice {
  id: string;
  property_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  line_items: Json;
  subtotal: number;
  markup_percentage: number;
  total_amount: number;
  status: InvoiceStatus;
  paid_at: string | null;
  stripe_invoice_id: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  property_id: string;
  title: string;
  category: DocumentCategory;
  file_url: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface Waitlist {
  id: string;
  email: string;
  full_name: string;
  property_location: string | null;
  square_footage: string | null;
  pain_points: string[] | null;
  budget_range: string | null;
  decision_timeline: string | null;
  survey_data: Json | null;
  status: WaitlistStatus;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      properties: {
        Row: Property;
        Insert: Omit<Property, "id" | "created_at">;
        Update: Partial<Omit<Property, "id" | "created_at">>;
      };
      service_requests: {
        Row: ServiceRequest;
        Insert: Omit<ServiceRequest, "id" | "requested_at">;
        Update: Partial<Omit<ServiceRequest, "id" | "requested_at">>;
      };
      vendors: {
        Row: Vendor;
        Insert: Omit<Vendor, "id" | "created_at" | "total_jobs_completed">;
        Update: Partial<Omit<Vendor, "id" | "created_at">>;
      };
      maintenance_schedules: {
        Row: MaintenanceSchedule;
        Insert: Omit<MaintenanceSchedule, "id">;
        Update: Partial<Omit<MaintenanceSchedule, "id">>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, "id" | "created_at">;
        Update: Partial<Omit<Invoice, "id" | "created_at">>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, "id" | "uploaded_at">;
        Update: Partial<Omit<Document, "id" | "uploaded_at">>;
      };
      waitlist: {
        Row: Waitlist;
        Insert: Omit<Waitlist, "id" | "created_at">;
        Update: Partial<Omit<Waitlist, "id" | "created_at">>;
      };
    };
  };
}
