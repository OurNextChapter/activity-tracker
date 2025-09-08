import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_supabase_project_url'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_anon_key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type definitions
export type UrgencyLevel = 'Low' | 'Medium' | 'High'
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical'
export type ProjectStatus = 'Planning' | 'In Progress' | 'Completed' | 'Blocked'
export type ProjectDomain = 'Business' | 'Creative' | 'Family' | 'Health' | 'Property'

// Project interface
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

// Task interface
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

// AdHocTask interface
export interface AdHocTask {
  id: string
  title: string
  description: string
  completed: boolean
  archived: boolean
  category: 'daily' | 'weekly' | 'monthly'
  created_at: string
  updated_at: string
}

// Database helper functions
export const saveToLocalStorage = (key: string, data: any) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data))
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export const loadFromLocalStorage = (key: string) => {
  try {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
  }
  return null
}

// Domain mapping functions for Supabase integration
export const mapDomainForStorage = (domain: string): string => {
  // Map SJT to Family for Supabase storage
  return domain === 'SJT' ? 'Family' : domain
}

export const mapDomainFromStorage = (domain: string): string => {
  // Keep Family as Family when loading from Supabase
  // This allows both SJT and Family projects to coexist
  return domain
}

// Project CRUD operations
export const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const projectToStore = {
      ...project,
      domain: mapDomainForStorage(project.domain)
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert([projectToStore])
      .select()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}

export const updateProject = async (id: string, updates: Partial<Project>) => {
  try {
    const updatesToStore = updates.domain 
      ? { ...updates, domain: mapDomainForStorage(updates.domain) }
      : updates
    
    const { data, error } = await supabase
      .from('projects')
      .update(updatesToStore)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating project:', error)
    throw error
  }
}

export const deleteProject = async (id: string) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting project:', error)
    throw error
  }
}

// Task CRUD operations
export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

export const updateTask = async (id: string, updates: Partial<Task>) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

export const deleteTask = async (id: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

// AdHocTask CRUD operations
export const createAdHocTask = async (task: Omit<AdHocTask, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('adhoc_tasks')
      .insert([task])
      .select()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating ad hoc task:', error)
    throw error
  }
}

export const updateAdHocTask = async (id: string, updates: Partial<AdHocTask>) => {
  try {
    const { data, error } = await supabase
      .from('adhoc_tasks')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating ad hoc task:', error)
    throw error
  }
}

export const deleteAdHocTask = async (id: string) => {
  try {
    const { error } = await supabase
      .from('adhoc_tasks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting ad hoc task:', error)
    throw error
  }
}

