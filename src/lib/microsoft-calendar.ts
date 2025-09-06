import { PublicClientApplication, Configuration } from '@azure/msal-browser'
import { Client } from '@microsoft/microsoft-graph-client'

// MSAL configuration
const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
}

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig)

// Microsoft Graph scopes
export const graphScopes = [
  'User.Read',
  'Calendars.ReadWrite',
  'Calendars.Read.Shared'
]

// Initialize MSAL
export const initializeMsal = async () => {
  try {
    await msalInstance.initialize()
    return true
  } catch (error) {
    console.error('MSAL initialization failed:', error)
    return false
  }
}

// Sign in to Microsoft
export const signInToMicrosoft = async () => {
  try {
    const loginRequest = {
      scopes: graphScopes,
      prompt: 'select_account'
    }
    
    const response = await msalInstance.loginPopup(loginRequest)
    return response
  } catch (error) {
    console.error('Microsoft sign-in failed:', error)
    throw error
  }
}

// Get access token
export const getAccessToken = async () => {
  try {
    const accounts = msalInstance.getAllAccounts()
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please sign in first.')
    }

    const silentRequest = {
      scopes: graphScopes,
      account: accounts[0]
    }

    const response = await msalInstance.acquireTokenSilent(silentRequest)
    return response.accessToken
  } catch (error) {
    console.error('Failed to get access token:', error)
    // Try interactive token acquisition
    try {
      const response = await msalInstance.acquireTokenPopup({
        scopes: graphScopes
      })
      return response.accessToken
    } catch (interactiveError) {
      console.error('Interactive token acquisition failed:', interactiveError)
      throw interactiveError
    }
  }
}

// Create Microsoft Graph client
export const createGraphClient = (accessToken: string) => {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken)
    }
  })
}

// Calendar event interface
export interface CalendarEvent {
  id?: string
  subject: string
  body?: {
    contentType: 'HTML' | 'Text'
    content: string
  }
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: {
    displayName: string
  }
  attendees?: Array<{
    emailAddress: {
      address: string
      name?: string
    }
  }>
}

// Get calendar events
export const getCalendarEvents = async (startDate?: Date, endDate?: Date) => {
  try {
    const accessToken = await getAccessToken()
    const graphClient = createGraphClient(accessToken)

    let url = '/me/events'
    const params: string[] = []

    if (startDate && endDate) {
      params.push(`startDateTime=${startDate.toISOString()}`)
      params.push(`endDateTime=${endDate.toISOString()}`)
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`
    }

    const events = await graphClient.api(url).get()
    return events.value
  } catch (error) {
    console.error('Failed to get calendar events:', error)
    throw error
  }
}

// Create calendar event
export const createCalendarEvent = async (event: CalendarEvent) => {
  try {
    const accessToken = await getAccessToken()
    const graphClient = createGraphClient(accessToken)

    const createdEvent = await graphClient.api('/me/events').post(event)
    return createdEvent
  } catch (error) {
    console.error('Failed to create calendar event:', error)
    throw error
  }
}

// Update calendar event
export const updateCalendarEvent = async (eventId: string, event: Partial<CalendarEvent>) => {
  try {
    const accessToken = await getAccessToken()
    const graphClient = createGraphClient(accessToken)

    const updatedEvent = await graphClient.api(`/me/events/${eventId}`).patch(event)
    return updatedEvent
  } catch (error) {
    console.error('Failed to update calendar event:', error)
    throw error
  }
}

// Delete calendar event
export const deleteCalendarEvent = async (eventId: string) => {
  try {
    const accessToken = await getAccessToken()
    const graphClient = createGraphClient(accessToken)

    await graphClient.api(`/me/events/${eventId}`).delete()
    return true
  } catch (error) {
    console.error('Failed to delete calendar event:', error)
    throw error
  }
}

// Check if user is signed in
export const isSignedIn = () => {
  const accounts = msalInstance.getAllAccounts()
  return accounts.length > 0
}

// Sign out
export const signOut = async () => {
  try {
    await msalInstance.logoutPopup()
    return true
  } catch (error) {
    console.error('Sign out failed:', error)
    throw error
  }
}

// Get user profile
export const getUserProfile = async () => {
  try {
    const accessToken = await getAccessToken()
    const graphClient = createGraphClient(accessToken)

    const user = await graphClient.api('/me').get()
    return user
  } catch (error) {
    console.error('Failed to get user profile:', error)
    throw error
  }
}

