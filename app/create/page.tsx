"use client"

import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { uploadPost } from "@/actions/postsActions"
import { useAuth } from "@/context/AuthContext"

const CreatePage = () => {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    router.push("/auth/login")
  }

  return (
    <div className="container max-w-2xl py-8 px-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload a Photo</CardTitle>
          <CardDescription>Share a moment with your followers</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={uploadPost} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image">Photo</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                name="caption"
                placeholder="Write a caption..."
                className="min-h-[100px]"
              />
            </div>
            <Button type="submit" className="w-full">
              Upload Photo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreatePage
