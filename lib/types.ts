export interface User {
  uid: string
  username: string
  email: string
  fullName?: string
  photoURL?: string
  bio?: string
  followers?: string[]
  following?: string[]
  createdAt: string
  displayName: string
}

export interface Post {
  id: string
  user: {
    uid: string
    username: string
    photoURL?: string
  }
  imageUrl: string
  caption?: string
  likes?: string[]
  comments?: Comment[]
  createdAt: string
}

export interface Comment {
  id: string
  userId: string
  username: string
  text: string
  createdAt: string
}