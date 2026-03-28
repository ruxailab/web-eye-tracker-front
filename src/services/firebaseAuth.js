import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const mapUser = (user) => {
  if (!user) {
    return null
  }

  const { uid, email, displayName } = user
  return { uid, email, displayName }
}

const saveUserProfile = async (user) => {
  if (!user) {
    return
  }

  const userProfile = {
    displayName: user.displayName || user.email || '',
    email: user.email || '',
  }

  await firebase
    .firestore()
    .collection('users')
    .doc(user.uid)
    .set(userProfile, { merge: true })
}

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const auth = firebase.auth()

    if (auth.currentUser) {
      resolve(mapUser(auth.currentUser))
      return
    }

    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        unsubscribe()
        resolve(mapUser(user))
      },
      (error) => {
        reject(error)
      }
    )
  })
}

export const signInWithGoogle = async () => {
  const provider = new firebase.auth.GoogleAuthProvider()
  const result = await firebase.auth().signInWithPopup(provider)
  const user = result.user

  await saveUserProfile(user)

  return mapUser(user)
}

export const signInWithEmail = async (email, password) => {
  const result = await firebase.auth().signInWithEmailAndPassword(email, password)
  return mapUser(result.user)
}

export const signUpWithEmail = async (email, password) => {
  const result = await firebase.auth().createUserWithEmailAndPassword(email, password)

  await saveUserProfile(result.user)

  return mapUser(result.user)
}
