"use client"

import { useEffect, useState } from "react"
import PostCard from "@/components/post-card"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query
} from "firebase/firestore"
import { Post } from "@/lib/types"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"

export default function FeedPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const { user, logOut } = useAuth()
  const getLatestPosts = async (limitCount = 10): Promise<Post[]> => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      )

      const postsSnapshot = await getDocs(postsQuery)
      const posts: Post[] = []

      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data()
        const userDoc = await getDoc(doc(db, "users", postData.userId))
        const userData = userDoc.data()

        posts.push({
          id: postDoc.id,
          user: {
            uid: userData?.uid,
            username: userData?.username,
            photoURL: userData?.photoURL
          },
          imageUrl: postData.imageUrl,
          caption: postData.caption,
          likes: postData.likes || [],
          comments: postData.comments || [],
          createdAt: postData.createdAt.toDate().toISOString()
        })
      }

      return posts
    } catch (error) {
      console.error("Error getting latest posts:", error)
      return []
    }
  }

  useEffect(() => {
    getLatestPosts().then((posts) => setPosts(posts))
  }, [])
  // const user = await getCurrentUser()

  return (
    <div className="container max-w-2xl">
      <div className="space-y-6">
        <Suspense fallback={<PostsSkeleton />}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={user} />
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No posts yet</h3>
              <p className="text-muted-foreground mt-1">
                Follow some users or create your first post!
              </p>
              <button onClick={logOut}>Logout</button>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}

function PostsSkeleton() {
  return (
    <div className="space-y-6">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-[300px] w-full rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
    </div>
  )
}
