-- LUMINA Estate Systems - Test Data Setup Script
-- Run this AFTER you've created your first user via the app

-- STEP 1: Make yourself an admin (REPLACE YOUR_EMAIL)
UPDATE profiles
SET role = 'admin', full_name = 'Admin User'
WHERE email = 'YOUR_EMAIL@example.com';

-- STEP 2: Get your user ID (you'll need this)
-- SELECT id FROM profiles WHERE email = 'YOUR_EMAIL@example.com';
-- Copy the ID and replace USER_ID_HERE below

-- STEP 3: Add sample vendors (already in seed.sql, but included here too)
INSERT INTO vendors (company_name, contact_name, email, phone, categories, hourly_rate, performance_rating, status)
VALUES
('Elite HVAC Services', 'Robert Johnson', 'robert@elitehvac.test', '206-555-1001', ARRAY['hvac'], 150.00, 4.8, 'active'),
('Premium Plumbing Co', 'Sarah Williams', 'sarah@premiumplumb.test', '206-555-1002', ARRAY['plumbing'], 135.00, 4.9, 'active'),
('Pacific Electric', 'Mike Chen', 'mike@pacificelectric.test', '206-555-1003', ARRAY['electrical'], 145.00, 4.7, 'active'),
('GreenView Landscaping', 'Emma Davis', 'emma@greenview.test', '206-555-1004', ARRAY['landscape'], 95.00, 4.6, 'active')
ON CONFLICT DO NOTHING;

-- STEP 4: Add a test property for your user
-- REPLACE 'USER_ID_HERE' with your actual user ID from Step 2
INSERT INTO properties (
  client_id,
  address,
  square_footage,
  year_built,
  systems,
  access_instructions,
  monthly_retainer,
  status
)
VALUES
(
  'USER_ID_HERE',  -- ⚠️ REPLACE THIS
  '456 Mercer Island Way, Mercer Island, WA 98040',
  12500,
  2018,
  '{
    "hvac": "3-zone Lennox system",
    "pool": "Heated infinity pool",
    "smart_home": "Control4 automation",
    "security": "ADT with cameras"
  }'::jsonb,
  'Gate code: 1234. Key under doormat.',
  8500.00,
  'active'
);

-- STEP 5: Get property ID for next steps
-- SELECT id FROM properties WHERE address LIKE '%Mercer Island%';
-- Copy the property ID and replace PROPERTY_ID_HERE below

-- STEP 6: Add sample service requests
-- Get vendor IDs first
-- SELECT id, company_name FROM vendors LIMIT 4;

INSERT INTO service_requests (
  property_id,
  title,
  description,
  category,
  priority,
  status,
  estimated_cost
)
VALUES
(
  'PROPERTY_ID_HERE',  -- ⚠️ REPLACE THIS
  'Annual HVAC Maintenance',
  'Routine inspection and filter replacement for all 3 zones',
  'hvac',
  'routine',
  'submitted',
  450.00
),
(
  'PROPERTY_ID_HERE',  -- ⚠️ REPLACE THIS
  'Pool Pump Making Noise',
  'Pool pump started making unusual grinding noise yesterday',
  'pool',
  'urgent',
  'submitted',
  NULL
);

-- STEP 7: Add maintenance schedules
INSERT INTO maintenance_schedules (
  property_id,
  service_type,
  frequency,
  next_due,
  automation_enabled,
  notes
)
VALUES
(
  'PROPERTY_ID_HERE',  -- ⚠️ REPLACE THIS
  'HVAC Filter Replacement',
  'quarterly',
  '2025-12-01',
  true,
  'All 3 zones - use MERV 13 filters'
),
(
  'PROPERTY_ID_HERE',  -- ⚠️ REPLACE THIS
  'Pool Cleaning',
  'weekly',
  '2025-11-01',
  true,
  'Includes chemical balancing'
),
(
  'PROPERTY_ID_HERE',  -- ⚠️ REPLACE THIS
  'Landscape Maintenance',
  'monthly',
  '2025-11-15',
  true,
  'Mowing, edging, pruning'
);

-- STEP 8: Add a sample invoice
INSERT INTO invoices (
  property_id,
  invoice_number,
  invoice_date,
  due_date,
  line_items,
  subtotal,
  markup_percentage,
  total_amount,
  status
)
VALUES
(
  'PROPERTY_ID_HERE',  -- ⚠️ REPLACE THIS
  'INV-202510-0001',
  '2025-10-01',
  '2025-10-31',
  '[
    {
      "description": "HVAC Maintenance - 3 zones",
      "date": "2025-10-15",
      "vendor_cost": 375.00,
      "markup": 20,
      "total": 450.00
    },
    {
      "description": "Pool Cleaning - October",
      "date": "2025-10-01",
      "vendor_cost": 400.00,
      "markup": 15,
      "total": 460.00
    }
  ]'::jsonb,
  775.00,
  17.4,
  910.00,
  'sent'
);

-- STEP 9: Verify everything was created
SELECT 'Vendors' as table_name, COUNT(*) as count FROM vendors
UNION ALL
SELECT 'Properties', COUNT(*) FROM properties
UNION ALL
SELECT 'Service Requests', COUNT(*) FROM service_requests
UNION ALL
SELECT 'Maintenance Schedules', COUNT(*) FROM maintenance_schedules
UNION ALL
SELECT 'Invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles;

-- You should see:
-- Vendors: 4+
-- Properties: 1+
-- Service Requests: 2+
-- Maintenance Schedules: 3+
-- Invoices: 1+
-- Profiles: 1+
