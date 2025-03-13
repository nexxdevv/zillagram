"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { User } from "@/lib/types"
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  logOut
} from "@/actions/authActions"

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: (username: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>
  logOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

import { ReactNode } from "react"
import { onAuthStateChanged } from "firebase/auth"

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser as User | null)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInWithGoogleHandler = async (username: string) => {
    try {
      await signInWithGoogle(username)
    } catch (error: any) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert("An unknown error occurred")
      }
    }
  }

  const signInWithEmailHandler = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const registerWithEmailHandler = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      await registerWithEmail(email, password, username)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const logOutHandler = async () => {
    await logOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle: signInWithGoogleHandler,
        signInWithEmail: signInWithEmailHandler,
        registerWithEmail: registerWithEmailHandler,
        logOut: logOutHandler
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
