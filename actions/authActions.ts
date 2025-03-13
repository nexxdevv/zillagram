import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  UserCredential
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"


// Google Sign-In
export const signInWithGoogle = async (
  username: string
): Promise<UserCredential | null> => {
  if (!username.trim()) {
    throw new Error("Please enter a username.")
  }

  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  const { uid, email, displayName, photoURL } = result.user

  // Check if username is available
  const usernameRef = doc(db, "usernames", username)
  const usernameSnap = await getDoc(usernameRef)

  if (usernameSnap.exists() && usernameSnap.data()?.uid !== uid) {
    throw new Error("Username is already taken by another user.")
  }

  // Store user data and reserve username
  await setDoc(
    doc(db, "users", uid),
    { uid, email, displayName, photoURL, username },
    { merge: true }
  )
  await setDoc(doc(db, "usernames", username), { uid })

  return result
}

// Email/Password Sign-In
export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
}

// Register with Email/Password
export const registerWithEmail = async (
  email: string,
  password: string,
  username: string
) => {
  if (!username.trim()) {
    throw new Error("Please enter a username.")
  }

  const usernameRef = doc(db, "usernames", username)
  const usernameSnap = await getDoc(usernameRef)

  if (usernameSnap.exists()) {
    throw new Error("Username is already taken.")
  }

  const result = await createUserWithEmailAndPassword(auth, email, password)
  const { uid } = result.user

  await setDoc(doc(db, "users", uid), { uid, email, username }, { merge: true })
  await setDoc(doc(db, "usernames", username), { uid })

  return result
}

// Log out
export const logOut = async () => {
  return signOut(auth)
}
