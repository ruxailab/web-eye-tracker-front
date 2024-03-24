import firebase from "firebase/compat/app"
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export default {
  signInWithGoogle: async () => {
    var provider = new firebase.auth.GoogleAuthProvider();
    var auth = await firebase.auth();
    try {
      const result = await auth.signInWithPopup(provider);
      let user = result.user;
      user = (({ displayName, email, uid }) => ({ displayName, email, uid }))(
        user
      );
      const userDB = (({ displayName, email }) => ({ displayName, email }))(
        user
      );
      firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .set(userDB)
        .catch((e) => console.error("Error updating document", e));

      return user;
    } catch (e) {
      console.error("error" + e);
    }
  },

  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      }, reject);
    });
  },

  logout: async () => {
    var auth = await firebase.auth();
    return auth.signOut();
  },
};
