import auth from '@/services/auth.js'

/**
 * Auth model providing authentication methods.
 */
export default {
    /**
     * Signs in a user using Google authentication.
     * @returns {Promise<Object>} A promise that resolves to the authenticated user object.
     */
    signInWithGoogle: async () => {
        var user = await auth.signInWithGoogle()
        return user
    },

    /**
     * Logs out the current user.
     * @returns {Promise<void>} A promise that resolves when the user is logged out.
     */
    logout: async () => {
        await auth.logout()
    },

    /**
     * Automatically signs in the current user if they are already authenticated.
     * @returns {Promise<Object>} A promise that resolves to the current user object.
     */
    autoSignIn: async () => {
        var user = await auth.getCurrentUser()
        return user
    },
}