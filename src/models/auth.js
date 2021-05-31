import auth from '@/services/auth.js'

export default {
    signInWithGoogle: async () => {
        var user = await auth.signInWithGoogle()
        return user
    },

    logout: async () => {
        await auth.logout()
    },

    isLoggedIn: async () => {
        var auth = await auth.getCurrentUser()
        if (auth == null) return false
        return true
    },

    autoSignIn: async () => {
        var user = await auth.getCurrentUser()
        return user
    },
}
