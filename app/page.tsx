"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { app, db } from "@/lib/firebase"
import Image from "next/image"
import FeedPosts from "@/components/feed-posts"

const LoginPage = () => {
  const { user, logOut } = useAuth()
  const auth = getAuth(app)
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")

  const checkUsernameAvailability = async (username: string, uid: string) => {
    const usernameRef = doc(db, "usernames", username)
    const usernameSnap = await getDoc(usernameRef)

    if (!usernameSnap.exists()) {
      return true // Username is available
    }

    // Check if the username is already linked to the same user
    const usernameData = usernameSnap.data()
    return usernameData.uid === uid
  }

  const handleGoogleSignIn = async () => {
    if (!username.trim()) {
      setError("Please enter a username.")
      return
    }

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const { uid, email, displayName, photoURL } = result.user

      const isAvailable = await checkUsernameAvailability(username, uid)
      if (!isAvailable) {
        setError(
          "Username is already taken by another user. Choose another one."
        )
        return
      }

      // Store user info and reserve username
      await setDoc(
        doc(db, "users", uid),
        { uid, email, fullName: displayName, photoURL, username },
        { merge: true }
      )
      await setDoc(doc(db, "usernames", username), { uid }) // Ensure username links to user
    } catch (err) {
      setError("Failed to sign in. Try again.")
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen pb-20 justify-center">
      {user ? (
        <FeedPosts />
      ) : (
        <div className="text-center grid">
          <h1 className="text-2xl font-bold">Sign In</h1>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded mt-4"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <button
            onClick={handleGoogleSignIn}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  )
}

export default LoginPage
