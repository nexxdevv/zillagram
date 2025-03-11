import LoginBtn from "@/components/LoginBtn"
import React from "react"
import UserSignedIn from "@/components/UserSignedIn"

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <LoginBtn />
      <UserSignedIn />
    </div>
  )
}

export default Home
