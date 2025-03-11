"use client"

import React from "react"
import { useAuth } from "@/context/AuthContext"

const LoginBtn = () => {
  const { signInWithGoogle, user } = useAuth()
  return (
    <div>
      {user ? (
        <p>Logged in</p>
      ) : (
        <button onClick={signInWithGoogle}>Login</button>
      )}
    </div>
  )
}

export default LoginBtn
