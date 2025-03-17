import auth from "@/models/auth";

/**
 * Vuex store module for authentication.
 * @module store/auth
 */

export default {
  state: {
    /**
     * The authenticated user.
     * @type {Object|null}
     */
    user: null,

    /**
     * Loading state.
     * @type {boolean|null}
     */
    loading: null,
  },
  getters: {
    /**
     * Get the loading state.
     * @param {Object} state - The state object.
     * @returns {boolean|null} The loading state.
     */
    getLoading(state) {
      return state.loading;
    },

    /**
     * Get the authenticated user.
     * @param {Object} state - The state object.
     * @returns {Object|null} The authenticated user.
     */
    getUser(state) {
      return state.user;
    },
  },
  mutations: {
    /**
     * Set the authenticated user.
     * @param {Object} state - The state object.
     * @param {Object} payload - The user object.
     */
    setUser(state, payload) {
      state.user = payload;
    },

    /**
     * Set the loading state.
     * @param {Object} state - The state object.
     * @param {boolean} payload - The loading state.
     */
    setLoading(state, payload) {
      state.loading = payload;
    },
  },
  actions: {
    /**
     * Sign in with Google.
     * @param {Object} context - The Vuex context object.
     * @returns {Promise<Object|null>} The authenticated user.
     */
    async signinwithgoogle({ commit }) {
      try {
        var user = await auth.signInWithGoogle(commit);
        user = (({ displayName, email, uid }) => ({ displayName, email, uid }))(
          user
        );
        commit("setUser", user);
        return user;
      } catch (err) {
        console.error('"Error when creating user.', err);
      }
    },

    /**
     * Automatically sign in the user.
     * @param {Object} context - The Vuex context object.
     * @returns {Promise<Object|null>} The authenticated user.
     */
    async autoSignIn({ commit }) {
      try {
        var user = await auth.autoSignIn();
        if (!user) return null;
        user = (({ displayName, email, uid }) => ({ displayName, email, uid }))(
          user
        );
        commit("setUser", user);
        return user;
      } catch (err) {
        console.error("Error when signin.", err);
      }
    },
  },
};
