-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE property_status AS ENUM ('active', 'inactive');
CREATE TYPE service_category AS ENUM ('hvac', 'plumbing', 'electrical', 'landscape', 'pool', 'general');
CREATE TYPE service_priority AS ENUM ('routine', 'urgent', 'emergency');
CREATE TYPE service_status AS ENUM ('submitted', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE maintenance_frequency AS ENUM ('weekly', 'monthly', 'quarterly', 'seasonal', 'annual');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue');
CREATE TYPE document_category AS ENUM ('hoa_rules', 'warranty', 'manual', 'permit', 'other');
CREATE TYPE vendor_status AS ENUM ('active', 'inactive');
CREATE TYPE waitlist_status AS ENUM ('pending', 'contacted', 'converted');

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'client',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    square_footage INTEGER,
    year_built INTEGER,
    systems JSONB,
    access_instructions TEXT,
    emergency_contacts JSONB,
    monthly_retainer DECIMAL(10, 2),
    status property_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    categories TEXT[] NOT NULL,
    hourly_rate DECIMAL(10, 2),
    insurance_expiry DATE,
    performance_rating DECIMAL(3, 2) CHECK (performance_rating >= 1 AND performance_rating <= 5),
    total_jobs_completed INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    status vendor_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create service_requests table
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category service_category NOT NULL,
    priority service_priority NOT NULL,
    status service_status NOT NULL DEFAULT 'submitted',
    client_notes TEXT,
    admin_notes TEXT,
    estimated_cost DECIMAL(10, 2),
    actual_cost DECIMAL(10, 2),
    assigned_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    photos TEXT[]
);

-- Create maintenance_schedules table
CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    frequency maintenance_frequency NOT NULL,
    last_completed DATE,
    next_due DATE NOT NULL,
    assigned_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    automation_enabled BOOLEAN NOT NULL DEFAULT false,
    notes TEXT
);

-- Create invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    line_items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    markup_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    status invoice_status NOT NULL DEFAULT 'draft',
    paid_at TIMESTAMPTZ,
    stripe_invoice_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category document_category NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create waitlist table
CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    property_location TEXT,
    square_footage TEXT,
    pain_points TEXT[],
    budget_range TEXT,
    decision_timeline TEXT,
    survey_data JSONB,
    status waitlist_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_properties_client_id ON properties(client_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_service_requests_property_id ON service_requests(property_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_assigned_vendor_id ON service_requests(assigned_vendor_id);
CREATE INDEX idx_maintenance_schedules_property_id ON maintenance_schedules(property_id);
CREATE INDEX idx_maintenance_schedules_next_due ON maintenance_schedules(next_due);
CREATE INDEX idx_invoices_property_id ON invoices(property_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_documents_property_id ON documents(property_id);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_waitlist_status ON waitlist(status);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- RLS Policies for properties
CREATE POLICY "Clients can view their own properties" ON properties
    FOR SELECT USING (
        client_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert properties" ON properties
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update properties" ON properties
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete properties" ON properties
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- RLS Policies for service_requests
CREATE POLICY "Users can view service requests for their properties" ON service_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties
            WHERE properties.id = service_requests.property_id
            AND (properties.client_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                ))
        )
    );

CREATE POLICY "Clients can create service requests for their properties" ON service_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM properties
            WHERE properties.id = property_id
            AND properties.client_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update service requests" ON service_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete service requests" ON service_requests
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- RLS Policies for vendors
CREATE POLICY "Authenticated users can view active vendors" ON vendors
    FOR SELECT USING (
        status = 'active'
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage vendors" ON vendors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- RLS Policies for maintenance_schedules
CREATE POLICY "Users can view maintenance schedules for their properties" ON maintenance_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties
            WHERE properties.id = maintenance_schedules.property_id
            AND (properties.client_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                ))
        )
    );

CREATE POLICY "Admins can manage maintenance schedules" ON maintenance_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices for their properties" ON invoices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties
            WHERE properties.id = invoices.property_id
            AND (properties.client_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                ))
        )
    );

CREATE POLICY "Admins can manage invoices" ON invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- RLS Policies for documents
CREATE POLICY "Users can view documents for their properties" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties
            WHERE properties.id = documents.property_id
            AND (properties.client_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM profiles
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                ))
        )
    );

CREATE POLICY "Admins can manage documents" ON documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- RLS Policies for waitlist (public insert, admin view)
CREATE POLICY "Anyone can join waitlist" ON waitlist
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view waitlist" ON waitlist
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update waitlist" ON waitlist
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update vendor job count
CREATE OR REPLACE FUNCTION update_vendor_job_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE vendors
        SET total_jobs_completed = total_jobs_completed + 1
        WHERE id = NEW.assigned_vendor_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vendor stats
CREATE TRIGGER update_vendor_stats
    AFTER UPDATE ON service_requests
    FOR EACH ROW
    WHEN (NEW.assigned_vendor_id IS NOT NULL)
    EXECUTE FUNCTION update_vendor_job_count();
