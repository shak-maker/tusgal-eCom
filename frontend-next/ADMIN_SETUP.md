# Admin Authentication Setup

This document explains how to set up admin authentication for the Tusgal eCommerce application.

## Prerequisites

1. Make sure you have Supabase configured with the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for admin user creation)

2. Ensure your Supabase project has authentication enabled.

## Setup Steps

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Create Admin User

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/admin-setup` in your browser
   - This page will create the admin user account
   - Click "Setup Admin User" to create the admin account

3. The admin credentials will be:
   - Email: `admin@tusgal.com`
   - Password: `admin123`

### 3. Login as Admin

1. Navigate to `/login`
2. Enter the admin credentials
3. You will be redirected to `/admin` upon successful login

## Features

### Authentication Flow

1. **Login Page** (`/login`):
   - Email and password authentication
   - Admin role verification
   - Redirect to admin dashboard on success

2. **Admin Dashboard** (`/admin`):
   - Protected route requiring admin authentication
   - Logout functionality
   - User session management

3. **Middleware Protection**:
   - Automatically redirects unauthenticated users to login
   - Checks admin role before allowing access to admin routes

### Security Features

- **Route Protection**: All `/admin/*` routes are protected
- **Role Verification**: Only users with admin role can access admin pages
- **Session Management**: Uses Supabase authentication with secure cookies
- **Automatic Logout**: Non-admin users are automatically signed out

## Customization

### Changing Admin Credentials

To change the admin email/password:

1. Update the admin setup API route (`/api/admin/setup/route.ts`)
2. Update the login page validation logic
3. Update the middleware admin check

### Adding More Admin Users

You can create additional admin users by:

1. Using the Supabase dashboard
2. Creating a new API route for admin user management
3. Adding admin users through the application interface

### Role-Based Access Control

The current implementation uses a simple admin check. For more complex role management:

1. Create a roles table in your database
2. Implement role-based middleware
3. Add role management to the admin interface

## Troubleshooting

### Common Issues

1. **"User not found" error**: Make sure the admin user was created successfully
2. **Authentication errors**: Check your Supabase environment variables
3. **Middleware redirects**: Ensure your Supabase project has authentication enabled

### Debug Steps

1. Check browser console for authentication errors
2. Verify Supabase configuration in your environment variables
3. Test authentication flow in Supabase dashboard
4. Check network requests for API errors

## API Endpoints

- `POST /api/admin/setup`: Creates the admin user account
- `GET /api/admin/*`: Protected admin API routes (future use)

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx (Admin dashboard)
│   ├── admin-setup/
│   │   └── page.tsx (Admin setup page)
│   ├── login/
│   │   └── page.tsx (Login page)
│   └── api/
│       └── admin/
│           └── setup/
│               └── route.ts (Admin setup API)
├── lib/
│   └── supabase.ts (Supabase client configuration)
└── middleware.ts (Route protection)
``` 