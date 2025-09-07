import { createClient } from '@supabase/supabase-js'

// Check if we have valid Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a real or mock Supabase client
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url') 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        select: () => ({
          order: () => ({
            then: (callback: (result: { data: unknown[]; error: null }) => void) => callback({ data: [], error: null })
          })
        }),
        insert: () => ({
          select: () => ({
            single: () => ({
              then: (callback: (result: { data: null; error: { message: string } }) => void) => 
                callback({ data: null, error: { message: 'Mock Supabase - not configured' } })
            })
          })
        }),
        update: () => ({
          eq: () => ({
            then: (callback: (result: { error: { message: string } }) => void) => 
              callback({ error: { message: 'Mock Supabase - not configured' } })
          })
        })
      })
    }

// Explicit type definitions to ensure consistency
export type UrgencyLevel = 'Low' | 'Medium' | 'High'
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical'
export type ProjectStatus = 'Planning' | 'In Progress' | 'Completed' | 'Blocked'
export type ProjectDomain = 'Business' | 'Creative' | 'Family' | 'Health' | 'Property'
export type AdHocCategory = 'daily' | 'weekly' | 'monthly'

// TypeScript interfaces for database tables
export interface Project {
  id: string
  title: string
  description: string
  domain: ProjectDomain
  priority: PriorityLevel
  urgency: UrgencyLevel
  status: ProjectStatus
  due_date: string | null
  archived: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string
  completed: boolean
  archived: boolean
  order_index: number
  document_url: string | null
  document_name: string | null
  created_at: string
  updated_at: string
}

export interface AdHocTask {
  id: string
  title: string
  description: string
  completed: boolean
  archived: boolean
  category: AdHocCategory
  created_at: string
  updated_at: string
}

