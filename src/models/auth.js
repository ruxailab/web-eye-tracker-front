import auth from '@/services/auth.js'

export default {
    signInWithGoogle: async () => {
        var user = await auth.signInWithGoogle()
        return user
    },

    logout: async () => {
        await auth.logout()
    },

    autoSignIn: async () => {
        var user = await auth.getCurrentUser()
        return user
    },
}
