"use client"

import { useRouter, redirect } from "next/navigation"
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  limit
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Post, Comment, User } from "@/lib/types"
import { auth } from "@/lib/firebase"

export async function getLatestPosts(limitCount = 10): Promise<Post[]> {
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

export async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    const postsQuery = query(
      collection(db, "posts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )

    const postsSnapshot = await getDocs(postsQuery)
    const userDoc = await getDoc(doc(db, "users", userId))
    const userData = userDoc.data()

    const posts: Post[] = postsSnapshot.docs.map((postDoc) => {
      const postData = postDoc.data()

      return {
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
      }
    })

    return posts
  } catch (error) {
    console.error("Error getting user posts:", error)
    return []
  }
}

export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const postDoc = await getDoc(doc(db, "posts", postId))

    if (!postDoc.exists()) {
      return null
    }

    const postData = postDoc.data()
    const userDoc = await getDoc(doc(db, "users", postData.userId))
    const userData = userDoc.data()

    return {
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
    }
  } catch (error) {
    console.error("Error getting post by ID:", error)
    return null
  }
}

export async function uploadPost(formData: FormData) {
  const user = auth.currentUser

  if (!user) {
    // Redirect to login page if the user is not authenticated

    redirect("/auth/login")
  }

  const caption = formData.get("caption") as string
  const imageFile = formData.get("image") as File

  if (!imageFile) {
    return { error: "No image provided" }
  }

  try {
    // Convert the File object to a base64 string
    const reader = new FileReader()
    reader.readAsDataURL(imageFile)
    reader.onloadend = async () => {
      const base64data = reader.result as string

      // Upload image to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/cloud-x/image/upload`,
        {
          method: "POST",
          body: JSON.stringify({
            file: base64data,
            upload_preset: "user_photos" // Use the preset "user_photos" from your Cloudinary account
          }),
          headers: {
            "Content-Type": "application/json"
          }
        }
      )

      const uploadResult = await response.json()
      const imageUrl = uploadResult.secure_url // Get the URL of the uploaded image

      // Create post in Firestore
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        caption,
        imageUrl,
        likes: [],
        comments: [],
        createdAt: serverTimestamp()
      })

      // Redirect to the homepage after successful upload

      redirect("/")
    }
  } catch (error) {
    console.error("Error uploading post:", error)
    return { error: "Failed to upload post" }
  }
}

export async function likePost(postId: string, userId: string, like: boolean) {
  try {
    const postRef = doc(db, "posts", postId)

    if (like) {
      await updateDoc(postRef, {
        likes: arrayUnion(userId)
      })
    } else {
      await updateDoc(postRef, {
        likes: arrayRemove(userId)
      })
    }

    // You can use `useRouter` here to revalidate or trigger a route change if needed

    redirect(`/post/${postId}`)
  } catch (error) {
    console.error("Error liking post:", error)
  }
}

export async function addComment(formData: FormData) {
  const user: User | null = auth.currentUser as User | null

  if (!user) {
    // Use the router from 'next/router' for client-side redirect
    redirect("/auth/login")
  }

  const postId = formData.get("postId") as string
  const commentText = formData.get("comment") as string

  if (!commentText.trim()) {
    return { error: "Comment cannot be empty" }
  }

  try {
    const postRef = doc(db, "posts", postId)

    // Ensure user and comment text are properly defined before creating comment
    const comment: Comment = {
      id: Date.now().toString() as string,
      userId: user?.uid as string, // Ensure userId is not undefined
      username: user?.username || "", // Ensure username is not undefined
      text: commentText.trim(), // Ensure text is not undefined
      createdAt: new Date().toISOString()
    }

    console.log("Comment:", comment)

    // Use arrayUnion safely
    await updateDoc(postRef, {
      comments: arrayUnion(comment)
    })

    // Redirect after successful comment addition

  } catch (error) {
    console.error("Error adding comment:", error)
    return { error: "Failed to add comment" }
  }
}
