"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { likePost, addComment } from "@/actions/postsActions"
import type { Post, User } from "@/lib/types"

interface PostCardProps {
  post: Post
  currentUser: User | null
}

export default function PostCard({ post, currentUser }: PostCardProps) {
  const [comment, setComment] = useState("")
  const [isLiked, setIsLiked] = useState(
    currentUser ? post.likes?.includes(currentUser.uid) || false : false
  )
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
  const [comments, setComments] = useState(post.comments || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLike = async () => {
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)
    if (currentUser) {
      await likePost(post.id, currentUser.uid, !isLiked)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || isSubmitting) return

    setIsSubmitting(true)

    const newComment = {
      id: Date.now().toString(),
      text: comment.trim(), // Ensure comment text is trimmed
      userId: currentUser?.uid || "", // Ensure userId is set
      username: post.user.username || "", // Ensure username is set
      createdAt: new Date().toISOString()
    }

    setComments([...comments, newComment])
    setComment("") // Reset the comment input

    const formData = new FormData()
    formData.append("postId", post.id || "") // Ensure postId is not undefined
    formData.append("comment", comment) // Ensure the comment is not undefined or empty

    const response = await addComment(formData)

    if (response?.error) {
      console.error("Error:", response.error)
    }

    setIsSubmitting(false)
  }

  return (
    <Card className="">
      <CardHeader className="px-4">
        <div className="flex items-center space-x-2">
          <Link href={`/profile/${post.user.username}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={post.user.photoURL || ""}
                alt={post.user.username}
              />
              <AvatarFallback>
                {post.user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              href={`/profile/${post.user.username}`}
              className="font-medium hover:underline"
            >
              {post.user.username}
            </Link>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <Image
            src={post.imageUrl || "/placeholder.svg?height=600&width=600"}
            alt={post.caption || "Post image"}
            width={600}
            height={600}
            className="object-cover aspect-[4/5]"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col px-4 space-y-3">
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={handleLike}
            className={isLiked ? "text-red-500" : ""}
          >
            <Heart
              size={22}
              className="w-6 h-6"
              fill={isLiked ? "currentColor" : "none"}
            />
          </button>
          <button>
            <MessageCircle size={22} className="w-6 h-6" />
          </button>
          <button>
            <Send size={22} className="h-6 w-6" />
          </button>
          <button className="ml-auto">
            <Bookmark size={22} className="w-6 h-6" />
          </button>
        </div>

        <div className="w-full">
          <div className="flex gap-1 items-baseline">
            <Link
              href={`/profile/${post.user.username}`}
              className="font-medium hover:underline"
            >
              {post.user.username}
            </Link>
            <p className=""> {post.caption}</p>
          </div>

          {comments.length > 0 && (
            <div className="mt-2 space-y-1">
              {comments.slice(0, 3).map((comment) => (
                <div key={comment.id} className="flex gap-1 items-baseline">
                  <Link
                    href={`/profile/${comment.username}`}
                    className="font-medium hover:underline"
                  >
                    <p>{comment.username}</p>
                  </Link>
                  <p>{comment.text}</p>
                </div>
              ))}
              {comments.length > 3 && (
                <Link
                  href={`/post/${post.id}`}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  View all {comments.length} comments
                </Link>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
        </div>

        <form
          onSubmit={handleComment}
          className="flex w-full items-center space-x-2"
        >
          <Input
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={!comment.trim() || isSubmitting}
          >
            Post
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
