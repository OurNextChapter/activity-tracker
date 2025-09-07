'use client'

import { useState, useEffect } from 'react'
import {
  initializeMsal,
  signInToMicrosoft,
  signOut,
  isSignedIn,
  getUserProfile,
  getCalendarEvents,
  CalendarEvent
} from '@/lib/microsoft-calendar'
interface CalendarEventDisplay {
  id?: string
  subject: string
  start: { dateTime: string; timeZone?: string }
  end: { dateTime: string; timeZone?: string }
  location?: { displayName?: string }
  attendees?: Array<{
    emailAddress: {
      address: string
      name?: string
    }
  }>
  isAllDay?: boolean
  isMeeting?: boolean
  isCall?: boolean
}

interface RollingCalendarProps {
  className?: string
}

export default function RollingCalendar({ className = '' }: RollingCalendarProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{
    displayName?: string
    mail?: string
    userPrincipalName?: string
  } | null>(null)
  const [events, setEvents] = useState<CalendarEventDisplay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())

  useEffect(() => {
    initializeMSAL()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadCalendarEvents()
    }
  }, [isAuthenticated, currentWeek])

  const initializeMSAL = async () => {
    try {
      const initialized = await initializeMsal()
      setIsInitialized(initialized)
      
      if (initialized) {
        const signedIn = isSignedIn()
        setIsAuthenticated(signedIn)
        
        if (signedIn) {
          await loadUserProfile()
        }
      }
    } catch (error) {
      console.error('Failed to initialize MSAL:', error)
      setError('Failed to initialize Microsoft authentication')
    }
  }

  const handleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      
      await signInToMicrosoft()
      setIsAuthenticated(true)
      
      await loadUserProfile()
    } catch (error) {
      console.error('Sign in failed:', error)
      setError('Failed to sign in to Microsoft')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setLoading(true)
      await signOut()
      setIsAuthenticated(false)
      setUser(null)
      setEvents([])
    } catch (error) {
      console.error('Sign out failed:', error)
      setError('Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile()
      setUser(profile)
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }

  const loadCalendarEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Calculate 3-week range: previous week, current week, next week
      const startOfCurrentWeek = getStartOfWeek(currentWeek)
      const startDate = new Date(startOfCurrentWeek)
      startDate.setDate(startDate.getDate() - 7) // Previous week
      
      const endDate = new Date(startOfCurrentWeek)
      endDate.setDate(endDate.getDate() + 21) // 3 weeks from start of current week
      
      const calendarEvents = await getCalendarEvents(startDate, endDate)
      
      // Process events to identify meetings and calls
      const processedEvents: CalendarEventDisplay[] = (calendarEvents || []).map((event: CalendarEvent) => {
        const subject = event.subject?.toLowerCase() || ''
        const location = event.location?.displayName?.toLowerCase() || ''
        const body = event.body?.content?.toLowerCase() || ''
        
        // Detect if it's a meeting or call
        const isMeeting = subject.includes('meeting') || 
                         subject.includes('standup') || 
                         subject.includes('sync') ||
                         subject.includes('review') ||
                         location.includes('teams') ||
                         location.includes('zoom') ||
                         (event.attendees && event.attendees.length > 1)
        
        const isCall = subject.includes('call') || 
                      subject.includes('phone') ||
                      subject.includes('dial') ||
                      location.includes('phone') ||
                      body.includes('call')
        
        return {
          ...event,
          isMeeting,
          isCall,
          isAllDay: (event as CalendarEvent & { isAllDay?: boolean }).isAllDay || false
        }
      })
      
      setEvents(processedEvents)
    } catch (error) {
      console.error('Failed to load calendar events:', error)
      setError('Failed to load calendar events')
    } finally {
      setLoading(false)
    }
  }

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  const getWeekDates = (startDate: Date) => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  if (!isInitialized) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar</h3>
        <p className="text-gray-600">Initializing calendar...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect Outlook'}
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-600 mb-4">
            Connect your Outlook calendar to see your meetings and calls in a rolling 3-week view.
          </p>
          <div className="text-sm text-gray-500">
            <p>Features available after connecting:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Rolling 3-week calendar view (past, current, next week)</li>
              <li>Outlook meetings and calls display</li>
              <li>Meeting vs call identification</li>
              <li>Quick navigation between weeks</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Calculate the three weeks to display
  const startOfCurrentWeek = getStartOfWeek(currentWeek)
  const previousWeek = new Date(startOfCurrentWeek)
  previousWeek.setDate(previousWeek.getDate() - 7)
  const nextWeek = new Date(startOfCurrentWeek)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const weeks = [
    { label: 'Previous Week', startDate: previousWeek, isPast: true },
    { label: 'Current Week', startDate: startOfCurrentWeek, isCurrent: true },
    { label: 'Next Week', startDate: nextWeek, isFuture: true }
  ]

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-sm text-gray-600 mr-4">
                {user.displayName}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Disconnect
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigateWeek('prev')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            ← Previous
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-900">
              {startOfCurrentWeek.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <button
              onClick={goToCurrentWeek}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Today
            </button>
          </div>

          <button
            onClick={() => navigateWeek('next')}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Next →
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading calendar events...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className={`border rounded-lg ${
                week.isCurrent ? 'border-blue-300 bg-blue-50' : 
                week.isPast ? 'border-gray-200 bg-gray-50' : 
                'border-green-200 bg-green-50'
              }`}>
                <div className={`px-4 py-2 border-b ${
                  week.isCurrent ? 'border-blue-200 bg-blue-100' : 
                  week.isPast ? 'border-gray-200 bg-gray-100' : 
                  'border-green-200 bg-green-100'
                }`}>
                  <h4 className={`font-medium ${
                    week.isCurrent ? 'text-blue-900' : 
                    week.isPast ? 'text-gray-700' : 
                    'text-green-900'
                  }`}>
                    {week.label}
                  </h4>
                </div>
                
                <div className="grid grid-cols-7 gap-1 p-2">
                  {getWeekDates(week.startDate).map((date, dayIndex) => {
                    const dayEvents = getEventsForDate(date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    
                    return (
                      <div key={dayIndex} className={`min-h-24 p-2 border rounded ${
                        isToday ? 'border-blue-400 bg-blue-100' : 'border-gray-200 bg-white'
                      }`}>
                        <div className={`text-xs font-medium mb-1 ${
                          isToday ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {date.toLocaleDateString('en-US', { 
                            weekday: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        
                        <div className="space-y-1">
                          {dayEvents.map((event, eventIndex) => (
                            <div
                              key={eventIndex}
                              className={`text-xs p-1 rounded truncate ${
                                event.isCall ? 'bg-orange-100 text-orange-800 border-l-2 border-orange-400' :
                                event.isMeeting ? 'bg-blue-100 text-blue-800 border-l-2 border-blue-400' :
                                'bg-gray-100 text-gray-800 border-l-2 border-gray-400'
                              }`}
                              title={`${event.subject}\n${formatTime(event.start.dateTime)} - ${formatTime(event.end.dateTime)}${event.location?.displayName ? `\n📍 ${event.location.displayName}` : ''}`}
                            >
                              <div className="flex items-center gap-1">
                                {event.isCall && <span>📞</span>}
                                {event.isMeeting && <span>👥</span>}
                                {!event.isCall && !event.isMeeting && <span>📅</span>}
                                <span className="truncate">{event.subject}</span>
                              </div>
                              {!event.isAllDay && (
                                <div className="text-xs opacity-75">
                                  {formatTime(event.start.dateTime)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Legend:</h5>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span>📞</span>
              <span className="text-orange-800">Calls</span>
            </div>
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span className="text-blue-800">Meetings</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📅</span>
              <span className="text-gray-800">Other Events</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-400 rounded"></div>
              <span className="text-gray-700">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
