# HR Management System

A comprehensive HR management web application built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- **Role-based Authentication**: Separate dashboards for HR managers and employees
- **Employee Management**: Complete CRUD operations for employee profiles
- **Skills Assessment**: Create and manage assessments with automatic scoring
- **Progress Tracking**: Visual progress indicators for career advancement
- **Analytics Dashboard**: Comprehensive reporting and analytics for HR
- **Responsive Design**: Mobile-first design that works on all devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: Supabase Auth with OAuth (GitHub, Google) and email/password
- **Deployment**: Vercel
- **UI Components**: Custom components with Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd hr-management-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and anon key
   - Enable GitHub and Google OAuth in Authentication > Providers
   - Set the redirect URL to: `http://localhost:3000/auth/callback`

4. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your Supabase credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   \`\`\`

5. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL scripts in order:
     1. `scripts/01-create-tables.sql`
     2. `scripts/02-create-policies.sql`
     3. `scripts/03-create-functions.sql`

6. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Tables

- **user_profiles**: Extended user information with roles and departments
- **levels**: Career progression levels with criteria
- **assessments**: Skills assessments with questions and scoring
- **assessment_results**: Individual assessment results and scores

### Row Level Security

The application uses Supabase's Row Level Security (RLS) to ensure:
- HR users can access all data
- Employees can only access their own data
- Proper data isolation between roles

## Project Structure

\`\`\`
/app
  /auth
    /login/page.tsx          # Login page
    /register/page.tsx       # Registration page
    /callback/route.ts       # OAuth callback handler
  /hr
    /dashboard/page.tsx      # HR dashboard with analytics
    /employees/page.tsx      # Employee management
    /assessments/page.tsx    # Assessment management
    /analytics/page.tsx      # Advanced analytics
  /employee
    /dashboard/page.tsx      # Employee dashboard
    /assessments/page.tsx    # Available assessments
    /profile/page.tsx        # Profile management
  /unauthorized/page.tsx     # Access denied page
  layout.tsx                 # Root layout with navigation
  page.tsx                   # Landing page

/components
  /ui/                       # Reusable UI components
  auth-form.tsx             # Authentication form
  navbar.tsx                # Navigation component

/lib
  /supabase/
    client.ts               # Client-side Supabase client
    server.ts               # Server-side Supabase client
    types.ts                # TypeScript types
  auth.ts                   # Authentication utilities
  utils.ts                  # Utility functions

/scripts
  01-create-tables.sql      # Database schema
  02-create-policies.sql    # RLS policies
  03-create-functions.sql   # Database functions
\`\`\`

## Key Features

### Authentication & Authorization
- Multi-provider OAuth (GitHub, Google)
- Email/password authentication
- Role-based access control (HR vs Employee)
- Secure session management

### HR Dashboard
- Employee overview and statistics
- Assessment management and creation
- Analytics and reporting
- Employee profile management

### Employee Dashboard
- Personal profile and progress tracking
- Available assessments
- Results history
- Career progression visualization

### Security
- Row Level Security (RLS) policies
- Server-side authentication checks
- Protected routes and API endpoints
- Secure data access patterns

## Deployment

### Vercel Deployment

1. **Connect to Vercel**
   \`\`\`bash
   npm i -g vercel
   vercel
   \`\`\`

2. **Set environment variables in Vercel dashboard**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Update Supabase OAuth settings**
   - Add your production URL to allowed redirect URLs
   - Update the redirect URL in OAuth providers

### Environment Variables

For production, make sure to set:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@yourcompany.com or create an issue in the repository.
