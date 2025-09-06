'use client'

import { useState, useEffect } from 'react'
import {
  initializeMsal,
  signInToMicrosoft,
  signOut,
  isSignedIn,
  getUserProfile,
  getCalendarEvents,
  createCalendarEvent,
  CalendarEvent
} from '@/lib/microsoft-calendar'

interface CalendarIntegrationProps {
  className?: string
}

export default function CalendarIntegration({ className = '' }: CalendarIntegrationProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ 
    name?: string; 
    email?: string; 
    displayName?: string; 
    mail?: string; 
    userPrincipalName?: string; 
  } | null>(null)
  const [events, setEvents] = useState<{ 
    id?: string; 
    subject: string; 
    start: { dateTime: string }; 
    end: { dateTime: string }; 
    location?: { displayName?: string };
  }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeMSAL()
  }, [])

  const initializeMSAL = async () => {
    try {
      const initialized = await initializeMsal()
      setIsInitialized(initialized)
      
      if (initialized) {
        const signedIn = isSignedIn()
        setIsAuthenticated(signedIn)
        
        if (signedIn) {
          await loadUserProfile()
          await loadCalendarEvents()
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
      await loadCalendarEvents()
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
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 7) // Next 7 days
      
      const calendarEvents = await getCalendarEvents(startDate, endDate)
      setEvents(calendarEvents || [])
    } catch (error) {
      console.error('Failed to load calendar events:', error)
      setError('Failed to load calendar events')
    }
  }

  const createSampleEvent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const now = new Date()
      const eventStart = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
      const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000) // 1 hour duration
      
      const event: CalendarEvent = {
        subject: 'Activity Tracker - Project Review',
        body: {
          contentType: 'HTML',
          content: '<p>Review progress on current projects and plan next steps.</p>'
        },
        start: {
          dateTime: eventStart.toISOString(),
          timeZone: 'UTC'
        },
        end: {
          dateTime: eventEnd.toISOString(),
          timeZone: 'UTC'
        },
        location: {
          displayName: 'Virtual Meeting'
        }
      }
      
      await createCalendarEvent(event)
      await loadCalendarEvents() // Refresh events
    } catch (error) {
      console.error('Failed to create event:', error)
      setError('Failed to create calendar event')
    } finally {
      setLoading(false)
    }
  }

  if (!isInitialized) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Microsoft Calendar</h3>
        <p className="text-gray-600">Initializing Microsoft Calendar integration...</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Microsoft Calendar</h3>
        {isAuthenticated ? (
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Signing out...' : 'Sign Out'}
          </button>
        ) : (
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isAuthenticated ? (
        <div className="space-y-4">
          {user && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                Signed in as: <strong>{user.displayName}</strong> ({user.mail || user.userPrincipalName})
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={loadCalendarEvents}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Refresh Events
            </button>
            <button
              onClick={createSampleEvent}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Create Sample Event
            </button>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Upcoming Events (Next 7 days)</h4>
            {events.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {events.map((event, index) => (
                  <div key={event.id || index} className="p-3 border border-gray-200 rounded">
                    <h5 className="font-medium text-gray-900">{event.subject}</h5>
                    <p className="text-sm text-gray-600">
                      {new Date(event.start.dateTime).toLocaleString()} - 
                      {new Date(event.end.dateTime).toLocaleString()}
                    </p>
                    {event.location?.displayName && (
                      <p className="text-sm text-gray-500">📍 {event.location.displayName}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No upcoming events found.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Connect your Microsoft Calendar to sync events and create new appointments directly from your Activity Tracker.
          </p>
          <div className="text-sm text-gray-500">
            <p>Features available after sign-in:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>View upcoming calendar events</li>
              <li>Create new events for project deadlines</li>
              <li>Sync project milestones with calendar</li>
              <li>Smart scheduling suggestions</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

