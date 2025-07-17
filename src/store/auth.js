// import auth from "@/models/auth";

// export default {
//   state: {
//     user: null,
//     loading: null,
//   },
//   getters: {
//     getLoading(state) {
//       return state.loading;
//     },
//     getUser(state) {
//       return state.user;
//     },
//   },
//   mutations: {
//     setUser(state, payload) {
//       state.user = payload;
//     },
//     setLoading(state, payload) {
//       state.loading = payload;
//     },
//   },
//   actions: {
//     async signinwithgoogle({ commit }) {
//       try {
//         var user = await auth.signInWithGoogle(commit);
//         user = (({ displayName, email, uid }) => ({ displayName, email, uid }))(
//           user
//         );
//         commit("setUser", user);
//         return user;
//       } catch (err) {
//         console.error('"Error when creating user.', err);
//       }
//     },
//     async autoSignIn({ commit }) {
//       try {
//         var user = await auth.autoSignIn();
//         if (!user) return null;
//         user = (({ displayName, email, uid }) => ({ displayName, email, uid }))(
//           user
//         );
//         commit("setUser", user);
//         return user;
//       } catch (err) {
//         console.error("Error when signin.", err);
//       }
//     },
//   },
// };
