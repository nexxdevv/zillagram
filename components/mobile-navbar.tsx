"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Compass, PlusSquare, Heart, User, HeartPulse } from "lucide-react"
import { RiPulseFill } from "react-icons/ri";
export default function MobileNavbar() {
  const pathname = usePathname()

  // Don't show on auth pages
  if (pathname.startsWith("/auth/")) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-20 border-t bg-background md:hidden">
      <div className="grid h-full grid-cols-5">
        <Link
          href="/"
          className={cn(
            "inline-flex flex-col items-center p-5 gap-2",
            pathname === "/" ? "text-orange-600" : "text-muted-foreground",
          )}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs">Home</span>
        </Link>

        <Link
          href="/search"
          className={cn(
            "inline-flex flex-col items-center  p-5 gap-2",
            pathname === "/search" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <Compass className="h-6 w-6" />
          <span className="text-xs">Discover</span>
        </Link>

        <Link
          href="/create"
          className={cn(
            "inline-flex flex-col items-center  p-5 gap-2",
            pathname === "/create" ? "text-orange-600" : "text-muted-foreground",
          )}
        >
          <PlusSquare className="h-6 w-6" />
          <span className="text-xs">Create</span>
        </Link>

        <Link
          href="/notifications"
          className={cn(
            "inline-flex flex-col items-center  p-5 gap-2",
            pathname === "/notifications" ? "text-primary" : "text-muted-foreground",
          )}
        >
          <RiPulseFill className="h-6 w-6" />
          <span className="text-xs">Activity</span>
        </Link>

        <Link
          href="/profile"
          className={cn(
            "inline-flex flex-col items-center  p-5 gap-2",
            pathname.startsWith("/profile") ? "text-primary" : "text-muted-foreground",
          )}
        >
          <User className="h-6 w-6" />
          <span className="text-xs">Profile</span>
        </Link>
      </div>
    </div>
  )
}

