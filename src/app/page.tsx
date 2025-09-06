'use client'

import { useState, useEffect } from 'react'
import { supabase, Project, Task } from '@/lib/supabase'

export default function ActivityTracker() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedTimezone, setSelectedTimezone] = useState('Sydney')
  
  // Modal states
  const [showAddProject, setShowAddProject] = useState(false)
  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [showArchived, setShowArchived] = useState(false)
  const [showArchivedTasks, setShowArchivedTasks] = useState<{[key: string]: boolean}>({})

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
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchProjects = async () => {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
        // Use sample data when Supabase is not configured
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
            created_at: '2025-09-04T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          }
        ]
        setProjects(sampleProjects)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('priority', { ascending: false })
      
      if (error) throw error
      setProjects((data as Project[]) || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
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
  const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProject: Project = {
        ...projectData,
        id: Date.now().toString(), // Simple ID generation for sample data
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setProjects(prev => [...prev, newProject])
      setShowAddProject(false)
    } catch (error) {
      console.error('Error adding project:', error)
    }
  }

  const archiveProject = async (projectId: string) => {
    try {
      setProjects(prev => 
        prev.map(p => p.id === projectId ? { ...p, archived: true, updated_at: new Date().toISOString() } : p)
      )
    } catch (error) {
      console.error('Error archiving project:', error)
    }
  }

  const unarchiveProject = async (projectId: string) => {
    try {
      setProjects(prev => 
        prev.map(p => p.id === projectId ? { ...p, archived: false, updated_at: new Date().toISOString() } : p)
      )
    } catch (error) {
      console.error('Error unarchiving project:', error)
    }
  }

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(), // Simple ID generation for sample data
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setTasks(prev => [...prev, newTask])
      setShowAddTask(false)
      setSelectedProjectId('')
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const archiveTask = async (taskId: string) => {
    try {
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, archived: true, updated_at: new Date().toISOString() } : t)
      )
    } catch (error) {
      console.error('Error archiving task:', error)
    }
  }

  const unarchiveTask = async (taskId: string) => {
    try {
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, archived: false, updated_at: new Date().toISOString() } : t)
      )
    } catch (error) {
      console.error('Error unarchiving task:', error)
    }
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
            {['dashboard', 'daily', 'weekly', 'monthly', 'projects', 'all-tasks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'all-tasks' ? 'All Tasks' : tab}
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
                domain: formData.get('domain') as string,
                priority: formData.get('priority') as string,
                urgency: formData.get('urgency') as 'Low' | 'Medium' | 'High',
                status: formData.get('status') as string,
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
                .map((project) => {
                const projectTasks = getProjectTasks(project.id)
                const completedTasks = getCompletedTasksCount(project.id)
                const progressPercentage = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0

                return (
                  <div key={project.id} className={`bg-white rounded-lg shadow-md border-l-4 ${getPriorityColor(project.priority)} p-6 ${project.archived ? 'opacity-75' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
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

        {/* Other Tab Views */}
        {activeTab === 'daily' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Daily View</h2>
            <p className="text-gray-600">Daily task management and scheduling coming soon...</p>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Weekly View</h2>
            <p className="text-gray-600">Weekly planning and calendar integration coming soon...</p>
          </div>
        )}

        {activeTab === 'monthly' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Monthly View</h2>
            <p className="text-gray-600">Monthly overview and long-term planning coming soon...</p>
          </div>
        )}

        {activeTab === 'all-tasks' && (
          <div className="space-y-8">
            {/* All Tasks Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Tasks</h2>
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
                            <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
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
