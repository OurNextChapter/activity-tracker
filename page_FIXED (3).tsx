'use client'

import { useState, useEffect } from 'react'
import { supabase, Project, Task, UrgencyLevel, PriorityLevel, ProjectStatus, ProjectDomain } from '@/lib/supabase'
import RollingCalendar from '@/components/RollingCalendar'

// Local AdHocTask interface definition
interface AdHocTask {
  id: string
  title: string
  description: string
  completed: boolean
  archived: boolean
  category: 'daily' | 'weekly' | 'monthly'
  created_at: string
  updated_at: string
}

export default function ActivityTracker() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [adHocTasks, setAdHocTasks] = useState<AdHocTask[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTimezone, setSelectedTimezone] = useState('Sydney')
  
  // Modal states
  const [showAddProject, setShowAddProject] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAddAdHocTask, setShowAddAdHocTask] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedAdHocCategory, setSelectedAdHocCategory] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [showArchived, setShowArchived] = useState(false)
  const [showArchivedTasks, setShowArchivedTasks] = useState<{[key: string]: boolean}>({})
  const [showArchivedAdHocTasks, setShowArchivedAdHocTasks] = useState<{[key: string]: boolean}>({
    daily: false,
    weekly: false,
    monthly: false
  })
  
  // Inline editing states
  const [editingProjectId, setEditingProjectId] = useState<string>('')
  const [editingProjectName, setEditingProjectName] = useState<string>('')

  // Drag and drop states
  const [draggedProjectId, setDraggedProjectId] = useState<string>('')
  const [dragOverProjectId, setDragOverProjectId] = useState<string>('')

  // Edit project states
  const [showEditProject, setShowEditProject] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const timezones = {
    Sydney: 'Australia/Sydney',
    Stockholm: 'Europe/Stockholm',
    Belfast: 'Europe/Belfast',
    Lisbon: 'Europe/Lisbon',
    Bangkok: 'Asia/Bangkok',
    Perth: 'Australia/Perth',
    Singapore: 'Asia/Singapore',
    'New York': 'America/New_York',
    'Los Angeles': 'America/Los_Angeles'
  }

  useEffect(() => {
    fetchProjects()
    fetchTasks()
    fetchAdHocTasks()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // localStorage helper functions
  const saveToLocalStorage = (key: string, data: Project[] | Task[] | AdHocTask[]) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(data))
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  const loadFromLocalStorage = (key: string) => {
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
  const mapDomainForStorage = (domain: string): string => {
    // Map SJT to Family for Supabase storage
    return domain === 'SJT' ? 'Family' : domain
  }

  const mapDomainFromStorage = (domain: string): string => {
    // Keep Family as Family when loading from Supabase
    // This allows both SJT and Family projects to coexist
    return domain
  }

  const fetchProjects = async () => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl && supabaseUrl !== 'your_supabase_project_url') {
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('order_index', { ascending: true })
        
        if (!error && data) {
          // Map domains from storage and set projects
          const mappedProjects = (data as Project[]).map(project => ({
            ...project,
            domain: mapDomainFromStorage(project.domain)
          }))
          setProjects(mappedProjects)
          // Also save to localStorage as cache
          saveToLocalStorage('activity-tracker-projects', mappedProjects)
          setLoading(false)
          return
        } else {
          console.log('Supabase fetch failed, trying localStorage:', error)
        }
      }

      // Fallback to localStorage
      const savedProjects = loadFromLocalStorage('activity-tracker-projects')
      if (savedProjects && savedProjects.length > 0) {
        setProjects(savedProjects)
        setLoading(false)
        return
      }

      // Final fallback to sample data
      const sampleProjects: Project[] = [
          {
            id: '1',
            title: 'Website Redesign',
            description: 'Complete redesign of company website with modern UI/UX',
            domain: 'Business',
            priority: 'High',
            urgency: 'Medium',
            status: 'In Progress',
            due_date: '2025-10-15',
            archived: false,
            order_index: 0,
            created_at: '2025-09-01T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '2',
            title: 'Property Investment Analysis',
            description: 'Research and analysis for potential property investments in Sydney',
            domain: 'Property',
            priority: 'Medium',
            urgency: 'Low',
            status: 'Planning',
            due_date: '2025-11-30',
            archived: false,
            order_index: 1,
            created_at: '2025-09-02T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '3',
            title: 'Family Vacation Planning',
            description: 'Plan and organize summer vacation for the family',
            domain: 'Family',
            priority: 'Medium',
            urgency: 'High',
            status: 'In Progress',
            due_date: '2025-12-01',
            archived: false,
            order_index: 2,
            created_at: '2025-09-03T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '4',
            title: 'Mobile App Development',
            description: 'Develop a new mobile application for task management',
            domain: 'Creative',
            priority: 'Critical',
            urgency: 'High',
            status: 'In Progress',
            due_date: '2025-09-30',
            archived: false,
            order_index: 3,
            created_at: '2025-08-15T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '5',
            title: 'Health & Fitness Program',
            description: 'Start a comprehensive health and fitness routine',
            domain: 'Health',
            priority: 'Medium',
            urgency: 'Medium',
            status: 'Planning',
            due_date: null,
            archived: false,
            order_index: 4,
            created_at: '2025-09-04T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          }
        ]
        setProjects(sampleProjects)
        saveToLocalStorage('activity-tracker-projects', sampleProjects)
        setLoading(false)
    } catch (error) {
      console.error('Error fetching projects:', error)
      // On error, try localStorage as final fallback
      const savedProjects = loadFromLocalStorage('activity-tracker-projects')
      if (savedProjects && savedProjects.length > 0) {
        setProjects(savedProjects)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      // First try to load from localStorage
      const savedTasks = loadFromLocalStorage('activity-tracker-tasks')
      if (savedTasks && savedTasks.length > 0) {
        setTasks(savedTasks)
        return
      }

      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
        // Use sample data when Supabase is not configured
        const sampleTasks: Task[] = [
          {
            id: '1',
            project_id: '1',
            title: 'Design wireframes',
            description: 'Create wireframes for all main pages',
            completed: true,
            archived: false,
            order_index: 1,
            document_url: 'https://example.com/wireframes.pdf',
            document_name: 'Wireframes.pdf',
            created_at: '2025-09-01T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '2',
            project_id: '1',
            title: 'Develop homepage',
            description: 'Code the new homepage design',
            completed: false,
            archived: false,
            order_index: 2,
            document_url: null,
            document_name: null,
            created_at: '2025-09-02T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '3',
            project_id: '1',
            title: 'Test responsive design',
            description: 'Test website on various devices',
            completed: false,
            archived: false,
            order_index: 3,
            document_url: null,
            document_name: null,
            created_at: '2025-09-03T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '4',
            project_id: '2',
            title: 'Market research',
            description: 'Research property market trends',
            completed: false,
            archived: false,
            order_index: 1,
            document_url: 'https://example.com/market-report.xlsx',
            document_name: 'Market Report.xlsx',
            created_at: '2025-09-02T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '5',
            project_id: '3',
            title: 'Book flights',
            description: 'Find and book flights for vacation',
            completed: true,
            archived: false,
            order_index: 1,
            document_url: null,
            document_name: null,
            created_at: '2025-09-03T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '6',
            project_id: '3',
            title: 'Reserve accommodation',
            description: 'Book hotel or vacation rental',
            completed: false,
            archived: false,
            order_index: 2,
            document_url: null,
            document_name: null,
            created_at: '2025-09-03T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '7',
            project_id: '4',
            title: 'UI/UX Design',
            description: 'Design app interface and user experience',
            completed: true,
            archived: false,
            order_index: 1,
            document_url: 'https://example.com/app-design.fig',
            document_name: 'App Design.fig',
            created_at: '2025-08-15T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '8',
            project_id: '4',
            title: 'Backend API Development',
            description: 'Develop REST API for the mobile app',
            completed: false,
            archived: false,
            order_index: 2,
            document_url: null,
            document_name: null,
            created_at: '2025-08-20T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          }
        ]
        setTasks(sampleTasks)
        saveToLocalStorage('activity-tracker-tasks', sampleTasks)
        return
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('order_index', { ascending: true })
      
      if (error) throw error
      setTasks((data as Task[]) || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchAdHocTasks = async () => {
    try {
      // First try to load from localStorage
      const savedAdHocTasks = loadFromLocalStorage('activity-tracker-adhoc-tasks')
      if (savedAdHocTasks && savedAdHocTasks.length > 0) {
        setAdHocTasks(savedAdHocTasks)
        return
      }

      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
        // Use sample data when Supabase is not configured
        const sampleAdHocTasks: AdHocTask[] = [
          {
            id: 'ah1',
            title: 'Review morning emails',
            description: 'Check and respond to important emails',
            completed: false,
            archived: false,
            category: 'daily',
            created_at: '2025-09-06T00:00:00Z',
            updated_at: '2025-09-06T00:00:00Z'
          },
          {
            id: 'ah2',
            title: 'Call dentist for appointment',
            description: 'Schedule routine dental checkup',
            completed: true,
            archived: false,
            category: 'daily',
            created_at: '2025-09-06T00:00:00Z',
            updated_at: '2025-09-06T00:00:00Z'
          },
          {
            id: 'ah3',
            title: 'Weekly grocery shopping',
            description: 'Buy groceries for the week',
            completed: false,
            archived: false,
            category: 'weekly',
            created_at: '2025-09-01T00:00:00Z',
            updated_at: '2025-09-06T00:00:00Z'
          },
          {
            id: 'ah4',
            title: 'Plan weekend activities',
            description: 'Research and plan family weekend activities',
            completed: false,
            archived: false,
            category: 'weekly',
            created_at: '2025-09-01T00:00:00Z',
            updated_at: '2025-09-06T00:00:00Z'
          },
          {
            id: 'ah5',
            title: 'Review monthly budget',
            description: 'Analyze spending and adjust budget for next month',
            completed: false,
            archived: false,
            category: 'monthly',
            created_at: '2025-09-01T00:00:00Z',
            updated_at: '2025-09-06T00:00:00Z'
          },
          {
            id: 'ah6',
            title: 'Update insurance policies',
            description: 'Review and update home and car insurance',
            completed: false,
            archived: false,
            category: 'monthly',
            created_at: '2025-08-01T00:00:00Z',
            updated_at: '2025-09-06T00:00:00Z'
          }
        ]
        setAdHocTasks(sampleAdHocTasks)
        saveToLocalStorage('activity-tracker-adhoc-tasks', sampleAdHocTasks)
        return
      }

      const { data, error } = await supabase
        .from('adhoc_tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setAdHocTasks((data as AdHocTask[]) || [])
    } catch (error) {
      console.error('Error fetching ad hoc tasks:', error)
    }
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', taskId)
      
      if (error) throw error
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'border-l-red-500 bg-red-50'
      case 'High': return 'border-l-orange-500 bg-orange-50'
      case 'Medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'Low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'Business': return 'bg-blue-100 text-blue-800'
      case 'Property': return 'bg-purple-100 text-purple-800'
      case 'Family': return 'bg-pink-100 text-pink-800'
      case 'Creative': return 'bg-indigo-100 text-indigo-800'
      case 'Health': return 'bg-green-100 text-green-800'
      case 'SJT': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProjectTasks = (projectId: string, includeArchived: boolean = false) => {
    return tasks.filter(task => 
      task.project_id === projectId && (includeArchived || !task.archived)
    )
  }

  const getCompletedTasksCount = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId, false) // Only count non-archived tasks
    return projectTasks.filter(task => task.completed).length
  }

  // New helper functions for project and task management
  const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'order_index'>) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl && supabaseUrl !== 'your_supabase_project_url') {
        // Create project data for Supabase with domain mapping
        const supabaseProjectData = {
          ...projectData,
          domain: mapDomainForStorage(projectData.domain), // Map SJT → Family
          order_index: projects.length,
          user_id: '00000000-0000-0000-0000-000000000000' // Default user ID for now
        }

        const { data, error } = await supabase
          .from('projects')
          .insert([supabaseProjectData])
          .select()
          .single()

        if (!error && data) {
          // Map domain back for UI display and add to state
          const newProject: Project = {
            ...data,
            domain: mapDomainFromStorage(data.domain)
          }
          const updatedProjects = [...projects, newProject]
          setProjects(updatedProjects)
          saveToLocalStorage('activity-tracker-projects', updatedProjects)
          setShowAddProject(false)
          return
        } else {
          console.error('Supabase insert failed:', error)
        }
      }

      // Fallback to localStorage-only mode
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(),
        order_index: projects.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const updatedProjects = [...projects, newProject]
      setProjects(updatedProjects)
      saveToLocalStorage('activity-tracker-projects', updatedProjects)
      setShowAddProject(false)
    } catch (error) {
      console.error('Error adding project:', error)
    }
  }

  const archiveProject = async (projectId: string) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl && supabaseUrl !== 'your_supabase_project_url') {
        const { error } = await supabase
          .from('projects')
          .update({ archived: true, updated_at: new Date().toISOString() })
          .eq('id', projectId)

        if (error) {
          console.error('Supabase archive failed:', error)
        }
      }

      // Update local state regardless of Supabase success/failure
      const updatedProjects = projects.map(p => 
        p.id === projectId ? { ...p, archived: true, updated_at: new Date().toISOString() } : p
      )
      setProjects(updatedProjects)
      saveToLocalStorage('activity-tracker-projects', updatedProjects)
    } catch (error) {
      console.error('Error archiving project:', error)
    }
  }

  const unarchiveProject = async (projectId: string) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl && supabaseUrl !== 'your_supabase_project_url') {
        const { error } = await supabase
          .from('projects')
          .update({ archived: false, updated_at: new Date().toISOString() })
          .eq('id', projectId)

        if (error) {
          console.error('Supabase unarchive failed:', error)
        }
      }

      // Update local state regardless of Supabase success/failure
      const updatedProjects = projects.map(p => 
        p.id === projectId ? { ...p, archived: false, updated_at: new Date().toISOString() } : p
      )
      setProjects(updatedProjects)
      saveToLocalStorage('activity-tracker-projects', updatedProjects)
    } catch (error) {
      console.error('Error unarchiving project:', error)
    }
  }

  // Inline editing functions
  const startEditingProject = (projectId: string, currentName: string) => {
    setEditingProjectId(projectId)
    setEditingProjectName(currentName)
  }

  const saveProjectName = async (projectId: string) => {
    if (!editingProjectName.trim()) {
      cancelEditingProject()
      return
    }

    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl && supabaseUrl !== 'your_supabase_project_url') {
        const { error } = await supabase
          .from('projects')
          .update({ 
            title: editingProjectName.trim(), 
            updated_at: new Date().toISOString() 
          })
          .eq('id', projectId)

        if (error) {
          console.error('Supabase update failed:', error)
        }
      }

      // Update local state regardless of Supabase success/failure
      const updatedProjects = projects.map(p => p.id === projectId ? { 
        ...p, 
        title: editingProjectName.trim(), 
        updated_at: new Date().toISOString() 
      } : p)
      setProjects(updatedProjects)
      saveToLocalStorage('activity-tracker-projects', updatedProjects)
      setEditingProjectId('')
      setEditingProjectName('')
    } catch (error) {
      console.error('Error updating project name:', error)
    }
  }

  const cancelEditingProject = () => {
    setEditingProjectId('')
    setEditingProjectName('')
  }

  const handleProjectNameKeyDown = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveProjectName(projectId)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEditingProject()
    }
  }

  // Drag and drop functions
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProjectId(projectId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', projectId)
    
    // Add visual feedback
    const target = e.target as HTMLElement
    target.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedProjectId('')
    setDragOverProjectId('')
    
    // Reset visual feedback
    const target = e.target as HTMLElement
    target.style.opacity = '1'
  }

  const handleDragOver = (e: React.DragEvent, projectId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverProjectId(projectId)
  }

  const handleDragLeave = () => {
    setDragOverProjectId('')
  }

  const handleDrop = (e: React.DragEvent, targetProjectId: string) => {
    e.preventDefault()
    const draggedId = e.dataTransfer.getData('text/html')
    
    if (draggedId && draggedId !== targetProjectId) {
      reorderProjects(draggedId, targetProjectId)
    }
    
    setDraggedProjectId('')
    setDragOverProjectId('')
  }

  // Edit project functions
  const openEditProject = (project: Project) => {
    setEditingProject({ ...project })
    setShowEditProject(true)
  }

  const closeEditProject = () => {
    setShowEditProject(false)
    setEditingProject(null)
  }

  const updateProject = async (updatedProject: Project) => {
    try {
      // Update in Supabase
      const projectToUpdate = {
        ...updatedProject,
        domain: mapDomainForStorage(updatedProject.domain),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('projects')
        .update(projectToUpdate)
        .eq('id', updatedProject.id)

      if (error) throw error

      // Update local state
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
      
      // Update localStorage
      const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p)
      saveToLocalStorage('activity-tracker-projects', updatedProjects)
      
      closeEditProject()
    } catch (error) {
      console.error('Error updating project:', error)
      // Fallback to localStorage only
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
      const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p)
      saveToLocalStorage('activity-tracker-projects', updatedProjects)
      closeEditProject()
    }
  }

  const reorderProjects = (draggedId: string, targetId: string) => {
    const draggedIndex = projects.findIndex(p => p.id === draggedId)
    const targetIndex = projects.findIndex(p => p.id === targetId)
    
    if (draggedIndex === -1 || targetIndex === -1) return
    
    const newProjects = [...projects]
    const [draggedProject] = newProjects.splice(draggedIndex, 1)
    newProjects.splice(targetIndex, 0, draggedProject)
    
    // Update order indices
    const updatedProjects = newProjects.map((project, index) => ({
      ...project,
      order_index: index
    }))
    
    setProjects(updatedProjects)
    saveToLocalStorage('activity-tracker-projects', updatedProjects)
  }

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(), // Simple ID generation for sample data
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const updatedTasks = [...tasks, newTask]
      setTasks(updatedTasks)
      saveToLocalStorage('activity-tracker-tasks', updatedTasks)
      setShowAddTask(false)
      setSelectedProjectId('')
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const archiveTask = async (taskId: string) => {
    try {
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, archived: true, updated_at: new Date().toISOString() } : t
      )
      setTasks(updatedTasks)
      saveToLocalStorage('activity-tracker-tasks', updatedTasks)
    } catch (error) {
      console.error('Error archiving task:', error)
    }
  }

  const unarchiveTask = async (taskId: string) => {
    try {
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, archived: false, updated_at: new Date().toISOString() } : t
      )
      setTasks(updatedTasks)
      saveToLocalStorage('activity-tracker-tasks', updatedTasks)
    } catch (error) {
      console.error('Error unarchiving task:', error)
    }
  }

  // Ad hoc task management functions
  const addAdHocTask = async (taskData: Omit<AdHocTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTask: AdHocTask = {
        ...taskData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const updatedAdHocTasks = [newTask, ...adHocTasks]
      setAdHocTasks(updatedAdHocTasks)
      saveToLocalStorage('activity-tracker-adhoc-tasks', updatedAdHocTasks)
      setShowAddAdHocTask(false)
    } catch (error) {
      console.error('Error adding ad hoc task:', error)
    }
  }

  const toggleAdHocTask = async (taskId: string, completed: boolean) => {
    try {
      const updatedAdHocTasks = adHocTasks.map(t => 
        t.id === taskId ? { ...t, completed: !completed, updated_at: new Date().toISOString() } : t
      )
      setAdHocTasks(updatedAdHocTasks)
      saveToLocalStorage('activity-tracker-adhoc-tasks', updatedAdHocTasks)
    } catch (error) {
      console.error('Error updating ad hoc task:', error)
    }
  }

  const archiveAdHocTask = async (taskId: string) => {
    try {
      const updatedAdHocTasks = adHocTasks.map(t => 
        t.id === taskId ? { ...t, archived: true, updated_at: new Date().toISOString() } : t
      )
      setAdHocTasks(updatedAdHocTasks)
      saveToLocalStorage('activity-tracker-adhoc-tasks', updatedAdHocTasks)
    } catch (error) {
      console.error('Error archiving ad hoc task:', error)
    }
  }

  const unarchiveAdHocTask = async (taskId: string) => {
    try {
      const updatedAdHocTasks = adHocTasks.map(t => 
        t.id === taskId ? { ...t, archived: false, updated_at: new Date().toISOString() } : t
      )
      setAdHocTasks(updatedAdHocTasks)
      saveToLocalStorage('activity-tracker-adhoc-tasks', updatedAdHocTasks)
    } catch (error) {
      console.error('Error unarchiving ad hoc task:', error)
    }
  }

  const getAdHocTasksByCategory = (category: 'daily' | 'weekly' | 'monthly', includeArchived = false) => {
    return adHocTasks.filter(task => 
      task.category === category && (includeArchived || !task.archived)
    )
  }

  const formatTime = (timezone: string) => {
    return currentTime.toLocaleTimeString('en-US', {
      timeZone: timezones[timezone as keyof typeof timezones],
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStats = () => {
    const activeProjects = projects.filter(p => !p.archived)
    const total = activeProjects.length
    const completed = activeProjects.filter(p => p.status === 'Completed').length
    const inProgress = activeProjects.filter(p => p.status === 'In Progress').length
    const critical = activeProjects.filter(p => p.priority === 'Critical').length
    
    return { total, completed, inProgress, critical }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading your Activity Tracker...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">Activity Tracker</h1>
              <p className="text-blue-100 mt-1">Manage your projects and commitments</p>
            </div>
            
            {/* World Clock */}
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{selectedTimezone}</span>
                  <select 
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="bg-transparent border-none text-white text-sm focus:outline-none cursor-pointer"
                  >
                    {Object.keys(timezones).map(tz => (
                      <option key={tz} value={tz} className="text-black">{tz}</option>
                    ))}
                  </select>
                </div>
                <div className="text-xl font-mono font-bold">
                  {formatTime(selectedTimezone)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['dashboard', 'calendar', 'daily', 'weekly', 'monthly', 'project-tasks', 'projects'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'project-tasks' ? 'Project Tasks' : tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Modals */}
      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Project</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              addProject({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                domain: formData.get('domain') as ProjectDomain,
                priority: formData.get('priority') as PriorityLevel,
                urgency: formData.get('urgency') as UrgencyLevel,
                status: formData.get('status') as ProjectStatus,
                due_date: formData.get('due_date') as string || null,
                archived: false
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Project title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Project description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                    <select
                      name="domain"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Business">Business</option>
                      <option value="Property">Property</option>
                      <option value="Family">Family</option>
                      <option value="Creative">Creative</option>
                      <option value="Health">Health</option>
                      <option value="SJT">SJT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                    <select
                      name="urgency"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                  <input
                    type="date"
                    name="due_date"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Task</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              addTask({
                project_id: selectedProjectId,
                title: formData.get('title') as string,
                description: formData.get('description') as string || null,
                completed: false,
                archived: false,
                order_index: tasks.filter(t => t.project_id === selectedProjectId).length + 1,
                document_url: formData.get('document_url') as string || null,
                document_name: formData.get('document_name') as string || null
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Task description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document URL (Optional)</label>
                  <input
                    type="url"
                    name="document_url"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/document.pdf"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Name (Optional)</label>
                  <input
                    type="text"
                    name="document_name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Document.pdf"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTask(false)
                    setSelectedProjectId('')
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Ad Hoc Task Modal */}
      {showAddAdHocTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add {selectedAdHocCategory.charAt(0).toUpperCase() + selectedAdHocCategory.slice(1)} Task</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              addAdHocTask({
                title: formData.get('title') as string,
                description: formData.get('description') as string || null,
                completed: false,
                archived: false,
                category: selectedAdHocCategory
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Task title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Task description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedAdHocCategory}
                    onChange={(e) => setSelectedAdHocCategory(e.target.value as 'daily' | 'weekly' | 'monthly')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddAdHocTask(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProject && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Project</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const updatedProject: Project = {
                ...editingProject,
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                domain: formData.get('domain') as ProjectDomain,
                priority: formData.get('priority') as PriorityLevel,
                urgency: formData.get('urgency') as UrgencyLevel,
                status: formData.get('status') as ProjectStatus,
                due_date: formData.get('due_date') as string || null,
                updated_at: new Date().toISOString()
              }
              updateProject(updatedProject)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingProject.title}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Project title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingProject.description}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Project description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                    <select
                      name="domain"
                      defaultValue={editingProject.domain}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Business">Business</option>
                      <option value="Property">Property</option>
                      <option value="Family">Family</option>
                      <option value="Creative">Creative</option>
                      <option value="Health">Health</option>
                      <option value="SJT">SJT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      defaultValue={editingProject.priority}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                    <select
                      name="urgency"
                      defaultValue={editingProject.urgency}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      defaultValue={editingProject.status}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
                  <input
                    type="date"
                    name="due_date"
                    defaultValue={editingProject.due_date || ''}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeEditProject}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Project Dashboard</h2>
                <p className="text-gray-600 mt-1">Manage your projects and track progress</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    showArchived 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {showArchived ? 'Hide Archived' : 'Show Archived'}
                </button>
                <button
                  onClick={() => setShowAddProject(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  + Add Project
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{stats.total}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Projects</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{stats.completed}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{stats.inProgress}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">In Progress</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{stats.critical}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Critical</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.critical}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects
                .filter(project => showArchived ? project.archived : !project.archived)
                .sort((a, b) => a.order_index - b.order_index)
                .map((project) => {
                const projectTasks = getProjectTasks(project.id)
                const completedTasks = getCompletedTasksCount(project.id)
                const progressPercentage = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0

                return (
                  <div 
                    key={project.id} 
                    className={`bg-white rounded-lg shadow-md border-l-4 ${getPriorityColor(project.priority)} p-6 ${project.archived ? 'opacity-75' : ''} ${
                      dragOverProjectId === project.id ? 'ring-2 ring-blue-400 ring-opacity-75' : ''
                    } transition-all duration-200 cursor-move`}
                    draggable={!project.archived}
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, project.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, project.id)}
                    title={project.archived ? 'Archived project' : 'Drag to reorder projects'}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          {editingProjectId === project.id ? (
                            <div className="flex-1 mr-2">
                              <input
                                type="text"
                                value={editingProjectName}
                                onChange={(e) => setEditingProjectName(e.target.value)}
                                onKeyDown={(e) => handleProjectNameKeyDown(e, project.id)}
                                onBlur={() => saveProjectName(project.id)}
                                className="text-lg font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 w-full"
                                autoFocus
                                placeholder="Project name..."
                              />
                            </div>
                          ) : (
                            <div className="flex-1 group">
                              <h3 
                                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors flex items-center"
                                onClick={() => startEditingProject(project.id, project.title)}
                                title="Click to edit project name"
                              >
                                {project.title}
                                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 text-sm">✏️</span>
                              </h3>
                            </div>
                          )}
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedProjectId(project.id)
                                setShowAddTask(true)
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              title="Add Task"
                            >
                              + Task
                            </button>
                            <button
                              onClick={() => openEditProject(project)}
                              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                              title="Edit Project"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => project.archived ? unarchiveProject(project.id) : archiveProject(project.id)}
                              className={`text-sm font-medium ${
                                project.archived 
                                  ? 'text-green-600 hover:text-green-800' 
                                  : 'text-gray-600 hover:text-gray-800'
                              }`}
                              title={project.archived ? 'Unarchive Project' : 'Archive Project'}
                            >
                              {project.archived ? '↶' : '📦'}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDomainColor(project.domain)}`}>
                            {project.domain}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'Blocked' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {project.urgency}
                          </span>
                        </div>

                        {project.due_date && (
                          <p className="text-xs text-gray-500 mb-3">
                            Due: {new Date(project.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {projectTasks.length > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{completedTasks}/{projectTasks.length} tasks</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Tasks */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Tasks</span>
                        {getProjectTasks(project.id, true).filter(t => t.archived).length > 0 && (
                          <button
                            onClick={() => setShowArchivedTasks(prev => ({
                              ...prev,
                              [project.id]: !prev[project.id]
                            }))}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            {showArchivedTasks[project.id] ? 'Hide Archived' : 'Show Archived'}
                          </button>
                        )}
                      </div>
                      {getProjectTasks(project.id, showArchivedTasks[project.id])
                        .slice(0, showArchivedTasks[project.id] ? 10 : 5)
                        .map((task) => (
                        <div key={task.id} className={`flex items-center space-x-2 ${task.archived ? 'opacity-60' : ''}`}>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id, task.completed)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={task.archived}
                          />
                          <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                            {task.title}
                          </span>
                          <div className="flex items-center space-x-1">
                            {task.document_url && (
                              <a
                                href={task.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 text-xs"
                                title={task.document_name || 'Open document'}
                              >
                                📎
                              </a>
                            )}
                            <button
                              onClick={() => task.archived ? unarchiveTask(task.id) : archiveTask(task.id)}
                              className={`text-xs ${
                                task.archived 
                                  ? 'text-green-600 hover:text-green-800' 
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                              title={task.archived ? 'Unarchive Task' : 'Archive Task'}
                            >
                              {task.archived ? '↶' : '🗃️'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-8">
            {/* Calendar Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
                <p className="text-gray-600 mt-1">Rolling 3-week view of your Outlook meetings and calls</p>
              </div>
            </div>

            {/* Rolling Calendar Component */}
            <RollingCalendar className="w-full" />
          </div>
        )}

        {/* Other Tab Views */}
        {activeTab === 'daily' && (
          <div className="space-y-8">
            {/* Daily Tasks Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Daily Tasks</h2>
                <p className="text-gray-600 mt-1">Manage your daily ad hoc tasks and quick to-dos</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowArchivedAdHocTasks(prev => ({ ...prev, daily: !prev.daily }))}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    showArchivedAdHocTasks.daily 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {showArchivedAdHocTasks.daily ? 'Hide Archived' : 'Show Archived'}
                </button>
                <button
                  onClick={() => {
                    setSelectedAdHocCategory('daily')
                    setShowAddAdHocTask(true)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  + Add Daily Task
                </button>
              </div>
            </div>

            {/* Daily Tasks List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                {getAdHocTasksByCategory('daily', showArchivedAdHocTasks.daily).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No daily tasks yet. Add your first daily task to get started!</p>
                  </div>
                ) : (
                  getAdHocTasksByCategory('daily', showArchivedAdHocTasks.daily).map((task) => (
                    <div key={task.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${task.archived ? 'opacity-75 bg-gray-50' : 'bg-white hover:bg-gray-50'} transition-colors`}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleAdHocTask(task.id, task.completed)}
                        disabled={task.archived}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => task.archived ? unarchiveAdHocTask(task.id) : archiveAdHocTask(task.id)}
                          className={`text-sm font-medium ${
                            task.archived 
                              ? 'text-green-600 hover:text-green-800' 
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                          title={task.archived ? 'Unarchive Task' : 'Archive Task'}
                        >
                          {task.archived ? '↶' : '🗃️'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="space-y-8">
            {/* Weekly Tasks Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Weekly Tasks</h2>
                <p className="text-gray-600 mt-1">Manage your weekly planning and recurring tasks</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowArchivedAdHocTasks(prev => ({ ...prev, weekly: !prev.weekly }))}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    showArchivedAdHocTasks.weekly 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {showArchivedAdHocTasks.weekly ? 'Hide Archived' : 'Show Archived'}
                </button>
                <button
                  onClick={() => {
                    setSelectedAdHocCategory('weekly')
                    setShowAddAdHocTask(true)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  + Add Weekly Task
                </button>
              </div>
            </div>

            {/* Weekly Tasks List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                {getAdHocTasksByCategory('weekly', showArchivedAdHocTasks.weekly).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No weekly tasks yet. Add your first weekly task to get started!</p>
                  </div>
                ) : (
                  getAdHocTasksByCategory('weekly', showArchivedAdHocTasks.weekly).map((task) => (
                    <div key={task.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${task.archived ? 'opacity-75 bg-gray-50' : 'bg-white hover:bg-gray-50'} transition-colors`}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleAdHocTask(task.id, task.completed)}
                        disabled={task.archived}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => task.archived ? unarchiveAdHocTask(task.id) : archiveAdHocTask(task.id)}
                          className={`text-sm font-medium ${
                            task.archived 
                              ? 'text-green-600 hover:text-green-800' 
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                          title={task.archived ? 'Unarchive Task' : 'Archive Task'}
                        >
                          {task.archived ? '↶' : '🗃️'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monthly' && (
          <div className="space-y-8">
            {/* Monthly Tasks Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Monthly Tasks</h2>
                <p className="text-gray-600 mt-1">Manage your monthly goals and long-term planning</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowArchivedAdHocTasks(prev => ({ ...prev, monthly: !prev.monthly }))}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    showArchivedAdHocTasks.monthly 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {showArchivedAdHocTasks.monthly ? 'Hide Archived' : 'Show Archived'}
                </button>
                <button
                  onClick={() => {
                    setSelectedAdHocCategory('monthly')
                    setShowAddAdHocTask(true)
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  + Add Monthly Task
                </button>
              </div>
            </div>

            {/* Monthly Tasks List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                {getAdHocTasksByCategory('monthly', showArchivedAdHocTasks.monthly).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No monthly tasks yet. Add your first monthly task to get started!</p>
                  </div>
                ) : (
                  getAdHocTasksByCategory('monthly', showArchivedAdHocTasks.monthly).map((task) => (
                    <div key={task.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${task.archived ? 'opacity-75 bg-gray-50' : 'bg-white hover:bg-gray-50'} transition-colors`}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleAdHocTask(task.id, task.completed)}
                        disabled={task.archived}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <div className="flex-1">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => task.archived ? unarchiveAdHocTask(task.id) : archiveAdHocTask(task.id)}
                          className={`text-sm font-medium ${
                            task.archived 
                              ? 'text-green-600 hover:text-green-800' 
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                          title={task.archived ? 'Unarchive Task' : 'Archive Task'}
                        >
                          {task.archived ? '↶' : '🗃️'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'project-tasks' && (
          <div className="space-y-8">
            {/* Project Tasks Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Project Tasks</h2>
                <p className="text-gray-600 mt-1">View all open tasks organized by project</p>
              </div>
              <button
                onClick={() => setShowAddProject(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                + Add Project
              </button>
            </div>

            {/* Tasks by Project */}
            <div className="space-y-6">
              {projects
                .filter(project => !project.archived)
                .filter(project => getProjectTasks(project.id).length > 0)
                .map((project) => {
                  const projectTasks = getProjectTasks(project.id)
                  const completedTasks = getCompletedTasksCount(project.id)
                  const progressPercentage = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0

                  return (
                    <div key={project.id} className="bg-white rounded-lg shadow-md border-l-4 border-l-blue-500 p-6">
                      {/* Project Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            {editingProjectId === project.id ? (
                              <div className="flex-1 mr-2">
                                <input
                                  type="text"
                                  value={editingProjectName}
                                  onChange={(e) => setEditingProjectName(e.target.value)}
                                  onKeyDown={(e) => handleProjectNameKeyDown(e, project.id)}
                                  onBlur={() => saveProjectName(project.id)}
                                  className="text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 w-full"
                                  autoFocus
                                  placeholder="Project name..."
                                />
                              </div>
                            ) : (
                              <div className="flex-1 group">
                                <h3 
                                  className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors flex items-center"
                                  onClick={() => startEditingProject(project.id, project.title)}
                                  title="Click to edit project name"
                                >
                                  {project.title}
                                  <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 text-sm">✏️</span>
                                </h3>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedProjectId(project.id)
                                  setShowAddTask(true)
                                }}
                                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                + Add Task
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDomainColor(project.domain)}`}>
                              {project.domain}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              project.status === 'Blocked' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {project.urgency}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                              project.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                              project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {project.priority}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{completedTasks}/{projectTasks.length} tasks completed</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tasks List */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Tasks</h4>
                        {projectTasks.map((task) => (
                          <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTask(task.id, task.completed)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <span className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {task.title}
                              </span>
                              {task.description && (
                                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {task.document_url && (
                                <a
                                  href={task.document_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700 text-sm"
                                  title={task.document_name || 'Open document'}
                                >
                                  📎
                                </a>
                              )}
                              <button
                                onClick={() => archiveTask(task.id)}
                                className="text-gray-400 hover:text-gray-600 text-sm"
                                title="Archive Task"
                              >
                                🗃️
                              </button>
                            </div>
                          </div>
                        ))}
                        {projectTasks.length === 0 && (
                          <p className="text-gray-500 text-sm italic">No tasks yet. Click &quot;Add Task&quot; to get started.</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              
              {projects.filter(p => !p.archived && getProjectTasks(p.id).length > 0).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No projects with tasks found.</p>
                  <p className="text-gray-400 text-sm mt-2">Create a project and add some tasks to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">All Projects</h2>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className={`border rounded-lg p-4 ${getPriorityColor(project.priority)}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDomainColor(project.domain)}`}>
                          {project.domain}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {project.priority}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {project.urgency}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'Blocked' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
