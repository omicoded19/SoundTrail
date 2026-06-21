import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
} from 'zustand/middleware'

import {
  getCurrentUser,
  loginUser,
  registerUser,
  type AuthUser,
  type LoginUserInput,
  type RegisterUserInput,
} from '@/services/auth-api'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  register: (
    input: RegisterUserInput,
  ) => Promise<boolean>

  login: (
    input: LoginUserInput,
  ) => Promise<boolean>

  restoreSession: () => Promise<void>

  logout: () => void

  clearError: () => void
}

export const useAuthStore =
  create<AuthState>()(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        async register(input) {
          set({
            isLoading: true,
            error: null,
          })

          try {
            const result =
              await registerUser(input)

            set({
              user: result.user,
              token: result.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })

            return true
          } catch (error) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Unable to create the account.',
            })

            return false
          }
        },

        async login(input) {
          set({
            isLoading: true,
            error: null,
          })

          try {
            const result =
              await loginUser(input)

            set({
              user: result.user,
              token: result.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })

            return true
          } catch (error) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Unable to log in.',
            })

            return false
          }
        },

        async restoreSession() {
          const token = get().token

          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            })

            return
          }

          set({
            isLoading: true,
            error: null,
          })

          try {
            const user =
              await getCurrentUser(token)

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
          } catch {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
          }
        },

        logout() {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })
        },

        clearError() {
          set({
            error: null,
          })
        },
      }),
      {
        name: 'soundtrail-auth',

        storage:
          createJSONStorage(
            () =>
              localStorage,
          ),

        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated:
            state.isAuthenticated,
        }),
      },
    ),
  )