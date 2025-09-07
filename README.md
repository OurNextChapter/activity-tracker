# Activity Tracker

A beautiful, modern project and task management application built with Next.js, featuring Microsoft Calendar integration and multi-domain project organization.

![Activity Tracker](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Ready-green?style=for-the-badge&logo=supabase)

## ✨ Features

### 🎯 Project Management
- **Multi-Domain Organization**: Business, Property, Family, Creative, Health
- **Priority System**: Critical, High, Medium, Low with color coding
- **Status Tracking**: Planning, In Progress, Completed, Blocked
- **Progress Visualization**: Real-time progress bars and completion tracking

### ✅ Task Management
- **Interactive Checkboxes**: Mark tasks as complete with visual feedback
- **Document Links**: Attach and access project documents
- **Task Ordering**: Organized task lists with custom ordering
- **Completion Tracking**: Visual progress indicators

### 🌍 World Clock Widget
- **Multi-Timezone Support**: 9 major timezones included
- **Real-Time Updates**: Live clock with second-by-second updates
- **Easy Switching**: Dropdown selector for quick timezone changes
- **Global Team Support**: Perfect for distributed teams

### 📅 Microsoft Calendar Integration
- **OAuth Authentication**: Secure Microsoft account integration
- **Event Management**: Create, read, update calendar events
- **Smart Scheduling**: Sync project deadlines with calendar
- **Upcoming Events**: View next 7 days of calendar events

### 🎨 Beautiful Interface
- **Gradient Design**: Modern blue-to-purple gradient header
- **Responsive Layout**: Works perfectly on desktop and mobile
- **Clean Navigation**: Intuitive tab-based navigation
- **Visual Feedback**: Smooth animations and transitions

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd activity-tracker
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

The application works immediately with sample data - no additional setup required!

## 📋 Navigation

- **Dashboard**: Main overview with project cards and statistics
- **Daily**: Daily task management (coming soon)
- **Weekly**: Weekly planning view (coming soon)
- **Monthly**: Monthly overview (coming soon)
- **Projects**: Detailed list view of all projects

## 🔧 Configuration

### Supabase Database (Optional)
```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Microsoft Calendar (Optional)
```bash
# Add to .env.local
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_client_id
NEXT_PUBLIC_MICROSOFT_TENANT_ID=your_tenant_id
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.2, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Microsoft MSAL
- **Calendar**: Microsoft Graph API
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main Activity Tracker component
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── CalendarIntegration.tsx # Microsoft Calendar component
└── lib/
    ├── supabase.ts           # Supabase client and interfaces
    └── microsoft-calendar.ts  # Microsoft Graph integration
```

## 🎯 Sample Data

The application includes comprehensive sample data:

- **5 Sample Projects** across different domains
- **8 Sample Tasks** with various completion states
- **Real-time Statistics** and progress tracking
- **Document Links** and attachments

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
- Netlify
- AWS Amplify
- Railway
- Any Node.js hosting platform

## 📖 Documentation

- **[Setup Guide](SETUP_GUIDE.md)**: Complete configuration instructions
- **[Progress Summary](PROGRESS_SUMMARY.md)**: Development progress and features

## 🔒 Security

- Environment variables for sensitive data
- Secure OAuth authentication
- HTTPS in production
- Regular dependency updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For help and support:
1. Check the [Setup Guide](SETUP_GUIDE.md)
2. Review browser console for errors
3. Verify environment configuration
4. Test with sample data first

---

**Built with ❤️ for productive project management across all areas of life.**
