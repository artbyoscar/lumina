-- Seed data for LUMINA Estate Systems MVP
-- Run this after applying migrations

-- Insert admin user profile (requires auth.users entry first)
-- You'll need to sign up an admin user via the app, then update their role:
-- UPDATE profiles SET role = 'admin', full_name = 'Admin User' WHERE email = 'admin@lumina.example';

-- Sample vendors
INSERT INTO vendors (company_name, contact_name, email, phone, categories, hourly_rate, insurance_expiry, performance_rating, total_jobs_completed, status) VALUES
('Pacific HVAC Systems', 'John Anderson', 'john@pacifichvac.com', '(206) 555-0101', ARRAY['hvac'], 150.00, '2025-12-31', 4.8, 127, 'active'),
('Emerald City Plumbing', 'Sarah Martinez', 'sarah@emeraldplumbing.com', '(206) 555-0102', ARRAY['plumbing'], 125.00, '2025-11-30', 4.9, 203, 'active'),
('Northwest Electric Pro', 'Michael Chen', 'michael@nwelectric.com', '(206) 555-0103', ARRAY['electrical'], 140.00, '2026-01-31', 4.7, 156, 'active'),
('GreenScape Landscaping', 'Emily Rodriguez', 'emily@greenscape.com', '(206) 555-0104', ARRAY['landscape'], 95.00, '2025-10-31', 4.6, 89, 'active'),
('Crystal Clear Pool Service', 'David Thompson', 'david@crystalclearpools.com', '(206) 555-0105', ARRAY['pool'], 110.00, '2025-12-15', 4.9, 234, 'active'),
('Premier Property Services', 'Lisa Johnson', 'lisa@premierservices.com', '(206) 555-0106', ARRAY['general', 'hvac', 'plumbing'], 135.00, '2026-03-31', 4.5, 178, 'active'),
('Elite Electrical Solutions', 'Robert Kim', 'robert@eliteelectric.com', '(206) 555-0107', ARRAY['electrical'], 145.00, '2025-09-30', 4.8, 92, 'active'),
('Cascade Landscape Design', 'Jennifer Wu', 'jennifer@cascadelandscape.com', '(206) 555-0108', ARRAY['landscape'], 100.00, '2026-02-28', 4.7, 145, 'active');

-- Note: Properties, service requests, maintenance schedules, and invoices require actual client user IDs
-- These should be created after users sign up via the application

-- Sample property (replace CLIENT_UUID with actual client ID after signup)
-- INSERT INTO properties (client_id, address, square_footage, year_built, systems, monthly_retainer, status) VALUES
-- ('CLIENT_UUID', '1234 Lakefront Drive, Bellevue, WA 98004', 12500, 2018, '{"hvac": "3-zone system", "pool": "Heated infinity pool", "smart_home": "Lutron + Control4", "dock": "Private boat dock"}', 8500.00, 'active');

-- Sample maintenance schedule (replace PROPERTY_UUID and VENDOR_UUID)
-- INSERT INTO maintenance_schedules (property_id, service_type, frequency, next_due, assigned_vendor_id, automation_enabled) VALUES
-- ('PROPERTY_UUID', 'HVAC Filter Replacement', 'quarterly', '2025-04-01', 'VENDOR_UUID', true);

-- Sample waitlist entries
INSERT INTO waitlist (email, full_name, property_location, square_footage, pain_points, budget_range, decision_timeline, status) VALUES
('james.wilson@example.com', 'James Wilson', 'mercer-island', '15000-20000', ARRAY['Vendor coordination', 'Maintenance tracking', 'HOA compliance'], '10k-15k', 'month', 'pending'),
('patricia.davis@example.com', 'Patricia Davis', 'medina', '20000+', ARRAY['Emergency response', 'Staff scheduling', 'Energy costs'], '15k+', 'immediate', 'pending'),
('thomas.anderson@example.com', 'Thomas Anderson', 'seattle', '10000-15000', ARRAY['Vendor coordination', 'Emergency response'], '5k-10k', 'quarter', 'pending');

-- Grant permissions helper
-- After creating your first admin user, run:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
