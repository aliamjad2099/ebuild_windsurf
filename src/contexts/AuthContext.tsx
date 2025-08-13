import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, type User } from '../lib/supabase'

type Session = any // Temporary type for session

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: { full_name: string; role: 'seller' | 'buyer' }) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Test Supabase connection first
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...')
        const { data, error } = await supabase.from('users').select('count').limit(1)
        console.log('Supabase connection test:', { data, error })
        
        if (error) {
          console.error('Supabase connection failed:', error)
        } else {
          console.log('Supabase connection successful')
        }
      } catch (err) {
        console.error('Supabase connection error:', err)
      }
    }
    
    testConnection()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      setSession(session)
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId)
      
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      )
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any

      console.log('User profile fetch result:', { data, error })

      if (error) {
        // If user profile doesn't exist, create a fallback user from auth data
        if (error.code === 'PGRST116') {
          console.log('User profile not found - creating fallback from auth data')
          
          // Get auth user data
          const { data: authUser } = await supabase.auth.getUser()
          if (authUser.user) {
            const fallbackUser = {
              id: authUser.user.id,
              email: authUser.user.email || '',
              full_name: authUser.user.user_metadata?.full_name || 'User',
              role: (authUser.user.user_metadata?.role || 'buyer') as 'seller' | 'buyer',
              membership_type: 'free' as const,
              created_at: authUser.user.created_at,
              updated_at: authUser.user.updated_at || authUser.user.created_at
            }
            console.log('Using fallback user:', fallbackUser)
            setUser(fallbackUser)
          } else {
            setUser(null)
          }
        } else {
          throw error
        }
      } else {
        console.log('User profile found:', data)
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: { full_name: string; role: 'seller' | 'buyer' }) => {
    try {
      console.log('Starting signup process...', { email, role: userData.role })
      
      // Add timeout to prevent hanging
      const signupPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
            membership_type: 'free'
          }
        }
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signup timeout - check your Supabase RLS policies')), 10000)
      )
      
      const { data, error } = await Promise.race([signupPromise, timeoutPromise]) as any

      console.log('Supabase auth signup result:', { data, error })

      if (error) throw error

      if (data.user) {
        console.log('Creating user profile...', data.user.id)
        
        try {
          // Create user profile with timeout
          const profilePromise = supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                full_name: userData.full_name,
                role: userData.role,
                membership_type: 'free',
              },
            ])
            
          const profileTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile creation timeout - check your Supabase RLS policies')), 5000)
          )
          
          const { error: profileError } = await Promise.race([profilePromise, profileTimeoutPromise]) as any

          console.log('Profile creation result:', { profileError })
          
          if (profileError) {
            console.warn('Profile creation failed, but auth user created:', profileError)
            // Don't throw error - user can still authenticate with just auth data
          } else {
            console.log('User profile created successfully')
          }
        } catch (profileError) {
          console.warn('Profile creation failed, but auth user created:', profileError)
          // Don't throw error - user can still authenticate with just auth data
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting signin process...', { email })
      
      // TEMPORARY: Check if we should use mock auth for testing
      if (email === 'demo@example.com' && password === 'demo123') {
        console.log('Using demo auth bypass')
        const mockUser = {
          id: 'demo-user-id',
          email: 'demo@example.com',
          full_name: 'Demo Seller',
          role: 'seller' as const,
          membership_type: 'free' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setUser(mockUser)
        setSession({ user: { id: mockUser.id, email: mockUser.email } } as any)
        return { data: { user: mockUser }, error: null }
      }
      
      // Add timeout to prevent hanging
      const signinPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signin timeout - check your Supabase RLS policies')), 10000)
      )
      
      const { data, error } = await Promise.race([signinPromise, timeoutPromise]) as any

      console.log('Supabase auth signin result:', { data, error })

      if (error) throw error

      console.log('User signed in successfully')
      return { data, error: null }
    } catch (error) {
      console.error('Signin error:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
