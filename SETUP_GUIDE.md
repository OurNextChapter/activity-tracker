# Activity Tracker - Complete Setup Guide

## 🚀 Quick Start

Your Activity Tracker application is **ready to use** right now! It's currently running at `http://localhost:3000` with sample data.

## 📋 What's Already Working

✅ **Beautiful Interface** - Gradient header, world clock, navigation tabs  
✅ **Project Management** - 5 sample projects with tasks and progress tracking  
✅ **Task Management** - Interactive checkboxes with completion tracking  
✅ **Real-time Features** - Live world clock with multiple timezones  
✅ **Responsive Design** - Works perfectly on desktop and mobile  
✅ **Microsoft Calendar Integration** - Ready to connect (setup required)  

## 🔧 Configuration Options

### Option 1: Use with Sample Data (Current Setup)
The application works perfectly with sample data - no additional setup required!

### Option 2: Connect to Supabase Database

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Update Environment Variables**
   ```bash
   # Edit .env.local file
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   ```

3. **Create Database Tables**
   Run this SQL in your Supabase SQL editor:
   ```sql
   -- Create projects table
   CREATE TABLE projects (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     domain TEXT NOT NULL,
     priority TEXT NOT NULL,
     urgency TEXT NOT NULL,
     status TEXT NOT NULL,
     due_date DATE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create tasks table
   CREATE TABLE tasks (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT,
     completed BOOLEAN DEFAULT FALSE,
     order_index INTEGER DEFAULT 0,
     document_url TEXT,
     document_name TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create calendar_events table
   CREATE TABLE calendar_events (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     start_time TIMESTAMP WITH TIME ZONE NOT NULL,
     end_time TIMESTAMP WITH TIME ZONE NOT NULL,
     location TEXT,
     attendees TEXT[],
     microsoft_event_id TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### Option 3: Enable Microsoft Calendar Integration

1. **Register App in Microsoft Entra ID**
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to "Microsoft Entra ID" > "App registrations"
   - Click "New registration"
   - Name: "Activity Tracker"
   - Redirect URI: `http://localhost:3000` (for development)

2. **Configure App Permissions**
   - Go to "API permissions"
   - Add permissions: `User.Read`, `Calendars.ReadWrite`, `Calendars.Read.Shared`
   - Grant admin consent

3. **Update Environment Variables**
   ```bash
   # Edit .env.local file
   NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_app_client_id
   NEXT_PUBLIC_MICROSOFT_TENANT_ID=your_tenant_id
   ```

4. **Add Calendar Component to Page**
   ```typescript
   // Add to src/app/page.tsx
   import CalendarIntegration from '@/components/CalendarIntegration'
   
   // Add in the dashboard view:
   <CalendarIntegration className="col-span-full" />
   ```

## 🚀 Deployment Options

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Update Redirect URIs**
   - Update Microsoft app registration with your Vercel URL
   - Update environment variables with production URLs

### Deploy to Netlify

1. **Build the Application**
   ```bash
   npm run build
   npm run export  # If using static export
   ```

2. **Deploy to Netlify**
   - Drag and drop the `out` folder to Netlify
   - Or connect your GitHub repository
   - Configure environment variables

## 📱 Features Overview

### Dashboard View
- **Stats Cards**: Overview of projects by status and priority
- **Project Cards**: Visual project management with progress bars
- **Task Management**: Interactive checkboxes with document links
- **World Clock**: Multi-timezone support for global teams

### Navigation Tabs
- **Dashboard**: Main overview with project cards
- **Daily**: Daily task management (placeholder for future enhancement)
- **Weekly**: Weekly planning view (placeholder for future enhancement)
- **Monthly**: Monthly overview (placeholder for future enhancement)
- **Projects**: List view of all projects with detailed information

### Project Organization
- **Domains**: Business, Property, Family, Creative, Health
- **Priorities**: Critical, High, Medium, Low (color-coded)
- **Status**: Planning, In Progress, Completed, Blocked
- **Urgency**: High, Medium, Low indicators

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Install new packages
npm install package-name
```

## 📁 Project Structure

```
activity-tracker/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main Activity Tracker component
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   └── CalendarIntegration.tsx # Microsoft Calendar component
│   └── lib/
│       ├── supabase.ts           # Supabase client and interfaces
│       └── microsoft-calendar.ts  # Microsoft Graph integration
├── .env.local                    # Environment variables
├── package.json                  # Dependencies and scripts
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── SETUP_GUIDE.md               # This file
└── PROGRESS_SUMMARY.md          # Development progress summary
```

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Regularly update dependencies for security patches

## 🆘 Troubleshooting

### Application Won't Start
- Check Node.js version (requires 18+)
- Run `npm install` to ensure dependencies are installed
- Check for port conflicts (default: 3000)

### Supabase Connection Issues
- Verify URL and API key in `.env.local`
- Check Supabase project status
- Ensure database tables are created

### Microsoft Calendar Issues
- Verify app registration in Azure Portal
- Check redirect URIs match your domain
- Ensure proper API permissions are granted

## 📞 Support

For additional help:
1. Check the browser console for error messages
2. Review the `PROGRESS_SUMMARY.md` file
3. Verify environment variable configuration
4. Test with sample data first before connecting external services

---

**🎉 Congratulations!** Your Activity Tracker is ready to help you manage projects across all areas of your life!

