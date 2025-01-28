import firebase from "firebase";

/**
 * Auth service for handling authentication with Google and Firebase.
 */
export default {
  /**
   * Signs in a user using Google authentication.
   * This function initiates a Google sign-in process, retrieves user information,
   * and updates the user's information in the Firestore database.
   * 
   * @async
   * @function signInWithGoogle
   * @returns {Promise<Object>} The signed-in user's information.
   * @throws Will throw an error if the sign-in process fails.
   */
  signInWithGoogle: async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider(); // Create a new Google Auth provider instance.
      const result = await firebase.auth().signInWithPopup(provider); // Trigger the Google sign-in popup.
      const user = result.user; // Retrieve the signed-in user information.

      if (!user) throw new Error("No user returned from Google sign-in."); // Handle cases where user info is missing.

      const userDB = {
        uid: user.uid, // Unique ID of the user.
        email: user.email, // User's email address.
        displayName: user.displayName, // User's display name.
        photoURL: user.photoURL, // URL to the user's profile photo.
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(), // Timestamp of the last login.
      };

      // Save the user information to the Firestore database.
      await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .set(userDB, { merge: true }) // Merge with existing data to prevent overwriting.
        .catch((e) => console.error("Error updating document", e));

      return user; // Return the signed-in user's information.
    } catch (e) {
      console.error("Error during Google sign-in:", e); // Log any errors during sign-in.
      throw e; // Re-throw the error for the calling function to handle.
    }
  },

  /**
   * Gets the currently authenticated user.
   * This function listens for changes in the authentication state and resolves
   * with the current user object when authentication is successful.
   * 
   * @function getCurrentUser
   * @returns {Promise<Object|null>} A promise that resolves with the current user object
   *                                  or null if no user is authenticated.
   */
  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      // Listen for authentication state changes.
      const unsubscribe = firebase.auth().onAuthStateChanged(
        (user) => {
          unsubscribe(); // Unsubscribe after retrieving the user object to avoid memory leaks.
          resolve(user); // Resolve the promise with the user object.
        },
        (error) => {
          reject(error); // Reject the promise if there's an error.
        }
      );
    });
  },

  /**
   * Logs out the currently authenticated user.
   * This function uses Firebase's `signOut` method to log out the user.
   * 
   * @async
   * @function logout
   * @returns {Promise<void>} A promise that resolves when the user is successfully logged out.
   */
  logout: async () => {
    try {
      const auth = firebase.auth(); // Get the Firebase authentication instance.
      await auth.signOut(); // Sign out the currently authenticated user.
      console.log("User logged out successfully."); // Log a success message.
    } catch (e) {
      console.error("Error during logout:", e); // Log any errors during logout.
      throw e; // Re-throw the error for the calling function to handle.
    }
  },
};