"use client"

import { User } from "@/lib/types"
import { useAuth } from "@/context/AuthContext"

const UserSignedIn = () => {
  const { user, logOut } = useAuth()
  return (
    <div className="mt-4 flex flex-col items-center">
      <button onClick={logOut}>Logout</button>
      <p>{(user as User)?.email}</p>
    </div>
  )
}

export default UserSignedIn
