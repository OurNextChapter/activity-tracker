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
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url' || !supabase) {
        // Use sample data when Supabase is not configured
        const sampleProjects: Project[] = [
          {
            id: '1', user_id: 'user1',
            title: 'Website Redesign',
            description: 'Complete redesign of company website with modern UI/UX',
            domain: 'Business',
            priority: 'High',
            urgency: 'Medium',
            status: 'In Progress',
            due_date: '2025-10-15',
            created_at: '2025-09-01T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '2', user_id: 'user1',
            title: 'Property Investment Analysis',
            description: 'Research and analysis for potential property investments in Sydney',
            domain: 'Property',
            priority: 'Medium',
            urgency: 'Low',
            status: 'Planning',
            due_date: '2025-11-30',
            created_at: '2025-09-02T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '3', user_id: 'user1',
            title: 'Family Vacation Planning',
            description: 'Plan and organize summer vacation for the family',
            domain: 'Family',
            priority: 'Medium',
            urgency: 'High',
            status: 'In Progress',
            due_date: '2025-12-01',
            created_at: '2025-09-03T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '4', user_id: 'user1',
            title: 'Mobile App Development',
            description: 'Develop a new mobile application for task management',
            domain: 'Creative',
            priority: 'Critical',
            urgency: 'High',
            status: 'In Progress',
            due_date: '2025-09-30',
            created_at: '2025-08-15T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '5', user_id: 'user1',
            title: 'Health & Fitness Program',
            description: 'Start a comprehensive health and fitness routine',
            domain: 'Health',
            priority: 'Medium',
            urgency: 'Medium',
            status: 'Planning',
            due_date: null,
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
      setProjects(data || [])
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
      if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url' || !supabase) {
        // Use sample data when Supabase is not configured
        const sampleTasks: Task[] = [
          {
            id: '1', user_id: 'user1',
            project_id: '1', user_id: 'user1',
            title: 'Design wireframes',
            description: 'Create wireframes for all main pages',
            completed: true,
            order_index: 1,
            document_url: 'https://example.com/wireframes.pdf',
            document_name: 'Wireframes.pdf',
            created_at: '2025-09-01T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '2', user_id: 'user1',
            project_id: '1', user_id: 'user1',
            title: 'Develop homepage',
            description: 'Code the new homepage design',
            completed: false,
            order_index: 2,
            document_url: null,
            document_name: null,
            created_at: '2025-09-02T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '3', user_id: 'user1',
            project_id: '1', user_id: 'user1',
            title: 'Test responsive design',
            description: 'Test website on various devices',
            completed: false,
            order_index: 3,
            document_url: null,
            document_name: null,
            created_at: '2025-09-03T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '4', user_id: 'user1',
            project_id: '2', user_id: 'user1',
            title: 'Market research',
            description: 'Research property market trends',
            completed: false,
            order_index: 1,
            document_url: 'https://example.com/market-report.xlsx',
            document_name: 'Market Report.xlsx',
            created_at: '2025-09-02T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '5', user_id: 'user1',
            project_id: '3', user_id: 'user1',
            title: 'Book flights',
            description: 'Find and book flights for vacation',
            completed: true,
            order_index: 1,
            document_url: null,
            document_name: null,
            created_at: '2025-09-03T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '6',
            project_id: '3', user_id: 'user1',
            title: 'Reserve accommodation',
            description: 'Book hotel or vacation rental',
            completed: false,
            order_index: 2,
            document_url: null,
            document_name: null,
            created_at: '2025-09-03T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '7',
            project_id: '4', user_id: 'user1',
            title: 'UI/UX Design',
            description: 'Design app interface and user experience',
            completed: true,
            order_index: 1,
            document_url: 'https://example.com/app-design.fig',
            document_name: 'App Design.fig',
            created_at: '2025-08-15T00:00:00Z',
            updated_at: '2025-09-05T00:00:00Z'
          },
          {
            id: '8',
            project_id: '4', user_id: 'user1',
            title: 'Backend API Development',
            description: 'Develop REST API for the mobile app',
            completed: false,
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
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      // Update local state immediately for better UX
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: !completed } : task
        )
      )

      // If Supabase is configured, update the database
      if (supabase) {
        const { error } = await supabase
          .from('tasks')
          .update({ completed: !completed })
          .eq('id', taskId)
        
        if (error) {
          // Revert local state if database update fails
          setTasks(prevTasks => 
            prevTasks.map(task => 
              task.id === taskId ? { ...task, completed: completed } : task
            )
          )
          throw error
        }
      }
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

  const getProjectTasks = (projectId: string) => {
    return tasks.filter(task => task.project_id === projectId)
  }

  const getCompletedTasksCount = (projectId: string) => {
    const projectTasks = getProjectTasks(projectId)
    return projectTasks.filter(task => task.completed).length
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
    const total = projects.length
    const completed = projects.filter(p => p.status === 'Completed').length
    const inProgress = projects.filter(p => p.status === 'In Progress').length
    const critical = projects.filter(p => p.priority === 'Critical').length
    
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
            {['dashboard', 'daily', 'weekly', 'monthly', 'projects'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
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
              {projects.map((project) => {
                const projectTasks = getProjectTasks(project.id)
                const completedTasks = getCompletedTasksCount(project.id)
                const progressPercentage = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0

                return (
                  <div key={project.id} className={`bg-white rounded-lg shadow-md border-l-4 ${getPriorityColor(project.priority)} p-6`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
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
                      {projectTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id, task.completed)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`text-sm flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                            {task.title}
                          </span>
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










