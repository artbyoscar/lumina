# LUMINA Estate Systems MVP

A production-ready luxury estate management platform for ultra-high-net-worth clients in the Pacific Northwest.

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Stripe
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React

## 🚀 Features

### Client Features
- ✅ Passwordless authentication with magic links
- ✅ Property dashboard with overview and statistics
- ✅ Service request management with status tracking
- ✅ Maintenance schedule calendar
- ✅ Invoice viewing and payment history
- ✅ Property information and documentation
- ✅ Profile and notification settings

### Admin Features
- ✅ Full access to all properties and clients
- ✅ Service request assignment and cost tracking
- ✅ Vendor directory with performance metrics
- ✅ Maintenance scheduling across all properties
- ✅ Invoice generation and management
- ✅ Waitlist management

### Public Features
- ✅ Landing page with value proposition
- ✅ Multi-step waitlist form with validation

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account ([supabase.com](https://supabase.com))
- (Optional) Stripe account for payments
- (Optional) Resend or SendGrid account for emails

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd lumina
npm install
```

### 2. Set Up Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Go to SQL Editor and run the migration:
   - Copy content from `supabase/migrations/20250101000000_initial_schema.sql`
   - Paste and execute in SQL Editor
4. (Optional) Run seed data from `supabase/seed.sql`
5. Create a storage bucket named `service-photos` (public access)

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe (Optional - for payment processing)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email (Optional - for notifications)
RESEND_API_KEY=your_resend_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
/app
  /waitlist          # Public landing page and waitlist form
  /auth              # Authentication pages (login, callback)
  /dashboard         # Main dashboard for clients and admins
  /requests          # Service request management
  /properties        # Property information and management
  /vendors           # Vendor directory (admin only)
  /maintenance       # Maintenance scheduling
  /invoices          # Invoice viewing and management
  /settings          # User settings and preferences

/components
  /ui               # shadcn/ui components (Button, Card, etc.)
  /dashboard        # Reusable dashboard components
  /forms            # Form components

/lib
  /supabase         # Supabase client configurations
  /actions          # Server actions for mutations
  /queries          # Data fetching functions
  /types            # TypeScript type definitions
  /utils            # Helper functions

/supabase
  /migrations       # Database schema migrations
  /functions        # Edge Functions (for future email automation)
```

## 🗄️ Database Schema

### Core Tables
- **profiles:** User accounts with roles (admin/client)
- **properties:** Estate properties with systems and details
- **service_requests:** Service tickets with status tracking
- **vendors:** Approved service providers
- **maintenance_schedules:** Recurring maintenance tasks
- **invoices:** Billing and payment records
- **documents:** Property documentation
- **waitlist:** Prospective client signups

### Security
- Row-Level Security (RLS) policies enforce data access
- Clients can only access their own data
- Admins have full access to all records

## 👤 User Roles

### Creating an Admin User

1. Sign up via the application at `/auth/login`
2. In Supabase SQL Editor, run:
```sql
UPDATE profiles
SET role = 'admin', full_name = 'Admin Name'
WHERE email = 'admin@yourdomain.com';
```

### Client Users
- Automatically assigned 'client' role on signup
- Can view their properties and create service requests
- Limited to read-only access for properties

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy

### Supabase Production Setup

1. Ensure migrations are applied to production database
2. Configure authentication providers in Supabase dashboard
3. Set up custom SMTP for magic link emails
4. Configure storage bucket policies

### Post-Deployment

1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Configure Supabase Auth redirect URLs
3. Set up Stripe webhooks (if using payments)
4. Test authentication and data access

## 🧪 Testing Checklist

- [ ] Magic link authentication works
- [ ] Client can view only their properties
- [ ] Client can create service requests
- [ ] Admin can view all data
- [ ] Admin can assign vendors to requests
- [ ] Waitlist form validates and submits
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1440px)
- [ ] RLS policies prevent unauthorized access
- [ ] Dark mode toggle works

## 📊 Sample Data

After setting up an admin account and creating test clients:

1. Add sample properties via the admin interface
2. Create service requests as a client
3. Assign vendors as an admin
4. Create maintenance schedules
5. Generate invoices for completed work

Or run the seed data script in Supabase SQL Editor after updating UUIDs.

## 🔐 Security Best Practices

- ✅ Environment variables not committed to repo
- ✅ Row-Level Security on all tables
- ✅ Passwordless authentication
- ✅ TypeScript strict mode enabled
- ✅ Input validation with Zod schemas
- ✅ Server-side data fetching with auth checks

## 🎨 Design System

- **Primary Color:** Navy (#1e3a5f)
- **Accent Color:** Gold (#d4af37)
- **Typography:** Inter (body), Playfair Display (headings)
- **Components:** Built with shadcn/ui and Tailwind CSS
- **Dark Mode:** Automatic based on system preference

## 📝 Future Enhancements

- [ ] Supabase Edge Functions for weekly email reports
- [ ] Real-time notifications with Supabase Realtime
- [ ] Stripe Customer Portal integration
- [ ] Document upload for properties
- [ ] Calendar view for maintenance scheduling
- [ ] Advanced vendor filtering and search
- [ ] Mobile app with React Native

## 🐛 Troubleshooting

### Authentication Issues
- Verify Supabase URL and keys in `.env.local`
- Check Supabase Auth settings for allowed redirect URLs
- Ensure email templates are configured in Supabase

### Database Errors
- Confirm migrations have been applied
- Check RLS policies are enabled
- Verify user has correct role in profiles table

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder and rebuild: `rm -rf .next && npm run dev`
- Check TypeScript errors: `npm run build`

## 📞 Support

For questions or issues with the LUMINA Estate Systems MVP, please refer to:
- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)
- Next.js Documentation: [nextjs.org/docs](https://nextjs.org/docs)
- shadcn/ui Documentation: [ui.shadcn.com](https://ui.shadcn.com)

---

**Built with ❤️ for luxury estate management**
