export interface User {
  uid: string
  displayName: string
  email: string
  photoURL?: string
  bio?: string
  followers?: string[]
  following?: string[]
  createdAt: string
}
