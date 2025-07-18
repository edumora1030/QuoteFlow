import { supabase } from '../lib/supabase'
import { User } from '../types'

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          return { 
            user: null as any, 
            error: 'Credenciales incorrectas. Verifica tu email y contraseña.' 
          }
        }
        return { user: null as any, error: error.message }
      }

      if (!data.user) {
        return { user: null as any, error: 'No user data received' }
      }

      // Get user profile from our users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        return { user: null as any, error: 'No se pudo obtener el perfil del usuario' }
      }

      const user: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar
      }

      return { user }
    } catch (error) {
      return { user: null as any, error: 'Error de conexión. Intenta de nuevo.' }
    }
  },

  async register(name: string, email: string, password: string, role: 'admin' | 'user' = 'user'): Promise<{ user: User; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        return { user: null as any, error: error.message }
      }

      if (!data.user) {
        return { user: null as any, error: 'No user data received' }
      }

      // Create user profile in our users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name,
          email,
          role
        })
        .select()
        .single()

      if (profileError || !profile) {
        return { user: null as any, error: 'Failed to create user profile' }
      }

      const user: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar
      }

      return { user }
    } catch (error) {
      return { user: null as any, error: 'Registration failed' }
    }
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut()
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile) return null

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar
      }
    } catch (error) {
      return null
    }
  },

  async updateProfile(userId: string, updates: { name?: string; email?: string; avatar?: string }): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()

      if (error) {
        console.error('Error updating profile:', error)
        return null
      }

      if (!data || data.length === 0) {
        console.error('No user found with ID:', userId)
        return null
      }

      return {
        id: data[0].id,
        name: data[0].name,
        email: data[0].email,
        role: data[0].role,
        avatar: data[0].avatar
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return null
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        return []
      }

      return data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }))
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  },

  async createUser(name: string, email: string, password: string, role: 'admin' | 'user' = 'user'): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('Ya existe un usuario registrado con este correo electrónico')
        }
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('No se recibieron datos del usuario')
      }

      // Create user profile in our users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name,
          email,
          role
        })
        .select()
        .single()

      if (profileError || !profile) {
        throw new Error('Error al crear el perfil del usuario')
      }

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar
      }
    } catch (error) {
      throw error
    }
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) {
        console.error('Error deleting user:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)

      if (error) {
        console.error('Error updating user:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  }
}