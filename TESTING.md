# LUMINA Estate Systems - Local Testing Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works perfectly)
- Email account for testing magic links

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in:
   - Name: `lumina-estate-mvp`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Wait 2-3 minutes for project to be created

## Step 2: Set Up Database

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase/migrations/20250101000000_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

## Step 3: Create Storage Bucket

1. Go to **Storage** in left sidebar
2. Click "Create a new bucket"
3. Name it: `service-photos`
4. Make it **public**
5. Click "Create bucket"

## Step 4: Get Your API Keys

1. Go to **Project Settings** (gear icon, bottom left)
2. Click **API** in the settings menu
3. You'll see:
   - Project URL (copy this)
   - anon/public key (copy this)
   - service_role key (copy this - keep it secret!)

## Step 5: Configure Environment Variables

1. In your terminal, navigate to the project:
   ```bash
   cd /home/user/lumina
   ```

2. Create `.env.local` file:
   ```bash
   cat > .env.local << 'EOF'
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   EOF
   ```

3. Edit the file and replace with your actual keys:
   ```bash
   nano .env.local
   ```
   (Press Ctrl+X, then Y, then Enter to save)

## Step 6: Install Dependencies & Run

```bash
# Install dependencies (if not already done)
npm install

# Run development server
npm run dev
```

The app should start at http://localhost:3000

## Step 7: Test the Application

### A. Test Landing Page
1. Open http://localhost:3000
2. You should see the LUMINA landing page
3. Click "Join Waitlist" button

### B. Test Waitlist Form
1. Fill out the multi-step form:
   - Step 1: Name, email, property location, square footage
   - Step 2: Select pain points (check multiple boxes)
   - Step 3: Budget range and timeline
2. Click "Submit"
3. Should see "Thank You!" success message
4. Verify in Supabase: Go to **Table Editor** > `waitlist` table

### C. Test Authentication
1. Go to http://localhost:3000/auth/login
2. Enter your email address
3. Click "Send Magic Link"
4. Check your email inbox
5. Click the magic link in the email
6. You should be redirected to the dashboard!

### D. Test Client Dashboard
1. After logging in, you'll see the dashboard
2. You'll see "No properties found" (expected for new users)
3. Navigation should show: Dashboard, Requests, Properties, etc.

### E. Create an Admin User
1. In Supabase Dashboard, go to **SQL Editor**
2. Run this query (replace with your email):
   ```sql
   UPDATE profiles
   SET role = 'admin', full_name = 'Admin User'
   WHERE email = 'your-email@example.com';
   ```
3. Refresh your browser
4. Dashboard should now say "Admin Dashboard"
5. You should now see "Vendors" in navigation

## Step 8: Add Test Data

### Add Sample Vendors (Admin View)
1. In Supabase SQL Editor, run:
   ```sql
   -- Already included in seed.sql!
   -- Go to Table Editor > vendors to see them
   ```

2. Or manually via SQL:
   ```sql
   INSERT INTO vendors (company_name, contact_name, email, phone, categories, hourly_rate, status)
   VALUES
   ('Test HVAC Co', 'John Doe', 'john@testhvac.com', '206-555-0100', ARRAY['hvac'], 150.00, 'active'),
   ('Test Plumbing', 'Jane Smith', 'jane@testplumb.com', '206-555-0101', ARRAY['plumbing'], 125.00, 'active');
   ```

### Add a Test Property
1. Get your user ID from profiles table:
   ```sql
   SELECT id, email FROM profiles WHERE email = 'your-email@example.com';
   ```

2. Insert a property:
   ```sql
   INSERT INTO properties (client_id, address, square_footage, year_built, monthly_retainer, status)
   VALUES
   ('YOUR_USER_ID_HERE', '123 Lake Washington Blvd, Seattle, WA 98122', 8500, 2020, 5000.00, 'active');
   ```

### Add a Test Service Request
1. Get property ID:
   ```sql
   SELECT id FROM properties WHERE address LIKE '%Lake Washington%';
   ```

2. Insert service request:
   ```sql
   INSERT INTO service_requests (property_id, title, description, category, priority, status)
   VALUES
   ('YOUR_PROPERTY_ID_HERE', 'HVAC Filter Replacement', 'Annual HVAC filter replacement needed', 'hvac', 'routine', 'submitted');
   ```

### Add Maintenance Schedule
```sql
INSERT INTO maintenance_schedules (property_id, service_type, frequency, next_due, automation_enabled)
VALUES
('YOUR_PROPERTY_ID_HERE', 'Pool Cleaning', 'weekly', '2025-11-01', true);
```

## Step 9: Test All Features

### Client Features
- ✅ View dashboard with property stats
- ✅ View service requests (/requests)
- ✅ Create new service request (/requests/new)
- ✅ View properties (/properties)
- ✅ View maintenance schedule (/maintenance)
- ✅ View settings (/settings)

### Admin Features (after setting role to admin)
- ✅ View all properties across clients
- ✅ View vendor directory (/vendors)
- ✅ Assign vendors to service requests
- ✅ Update service request costs
- ✅ View all maintenance schedules

## Step 10: Test on Mobile

1. Find your local IP address:
   ```bash
   # On Mac/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Or
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

2. Update Supabase Auth settings:
   - Go to Authentication > URL Configuration
   - Add redirect URL: `http://YOUR_IP:3000/auth/callback`

3. Open on your phone: `http://YOUR_IP:3000`

4. Test responsive design at different breakpoints

## Troubleshooting

### "Invalid API key"
- Check that you copied the correct keys from Supabase
- Make sure .env.local has no extra spaces
- Restart the dev server: Ctrl+C then `npm run dev`

### "Failed to fetch"
- Check your internet connection
- Verify Supabase project is running (green status)
- Check browser console for errors (F12)

### Email not arriving
- Check spam folder
- In Supabase, go to Authentication > Email Templates
- Verify SMTP is configured (default uses Supabase's test SMTP)
- For production, set up custom SMTP

### "No properties found"
- Run the SQL insert statements above
- Verify property was created in Table Editor
- Check that client_id matches your user ID

### Build errors
- Clear .next folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## Quick Test Script

Run this to quickly populate test data:

```bash
# 1. Create admin user (replace YOUR_EMAIL)
echo "UPDATE profiles SET role = 'admin', full_name = 'Admin User' WHERE email = 'YOUR_EMAIL@example.com';" | pbcopy

# 2. Then in Supabase SQL Editor, paste and run

# 3. Add sample data
cat supabase/seed.sql
# Copy vendors INSERT statements and run in SQL Editor
```

## What to Test

### Critical Paths ✅
1. **Signup Flow**: Email → Magic Link → Dashboard
2. **Create Service Request**: Dashboard → New Request → Submit → View in List
3. **Admin Access**: Change role → Access Vendors → View All Properties
4. **Responsive Design**: Test on mobile (375px), tablet (768px), desktop (1440px)

### Security Tests ✅
1. Try accessing /vendors as a client (should redirect)
2. Try viewing another user's property (should fail with RLS)
3. Check that admin can see all data

### UI/UX Tests ✅
1. Dark mode toggle (respects system preference)
2. Form validation (try submitting empty forms)
3. Loading states (submit forms and watch for spinners)
4. Error messages (enter invalid data)

---

## 🎉 Success Criteria

You've successfully tested the MVP when:
- ✅ You can sign up and receive magic link
- ✅ Dashboard loads with property data
- ✅ Can create service requests
- ✅ Admin can access vendor directory
- ✅ Forms validate properly
- ✅ Mobile responsive design works
- ✅ No console errors in browser

---

## Next Steps

Once testing is complete:
1. Deploy to Vercel (connect GitHub repo)
2. Update environment variables in Vercel
3. Configure custom domain
4. Set up production SMTP for emails
5. Add Stripe keys for payment processing

Enjoy your LUMINA Estate Systems MVP! 🏡✨
