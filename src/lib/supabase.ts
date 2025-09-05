import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client with fallback for missing configuration
export const supabase = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url' 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null


// Types for our database tables
export interface Project {
  id: string
  created_at: string
  updated_at: string
  title: string
  description: string | null
  domain: 'Business' | 'Property' | 'Family' | 'Creative' | 'Health'
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked'
  urgency: 'Immediate' | 'This Week' | 'This Month' | 'Ongoing'
  due_date: string | null
  user_id: string
}

export interface Task {
  id: string
  created_at: string
  updated_at: string
  project_id: string
  title: string
  completed: boolean
  document_url: string | null
  document_name: string | null
  document_type: 'Document' | 'Spreadsheet' | 'Presentation' | 'PDF' | 'Web Link' | 'Calendar Event' | null
  order_index: number
}

export interface CalendarEvent {
  id: string
  created_at: string
  user_id: string
  microsoft_event_id: string | null
  title: string
  start_time: string
  end_time: string
  description: string | null
  location: string | null
}
