<template>
  <v-app-bar dark dense>
    <div @click="$router.push('/')" style="cursor:pointer">
      <v-app-bar-title>Eye Lab</v-app-bar-title>
    </div>
    <v-spacer />
    <v-btn text dark to="/" v-if="$route.name != 'Dashboard'">
      {{ $route.name != 'Login' ? 'Calibration' : 'Home' }}
    </v-btn>
    <v-btn
      text
      dark
      to="/login"
      v-if="$route.name != 'Login' && $store.state.auth.user == null"
    >
      Login
      <v-icon right>mdi-login</v-icon>
    </v-btn>
    <v-btn text dark v-if="$store.state.auth.user != null" @click="logout()">
      Logout
      <v-icon right>mdi-logout</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
/**
 * Toolbar component
 * 
 * This component provides a method to handle user logout functionality.
 * 
 * Methods:
 * - logout: Asynchronously logs out the user, commits a mutation to clear the user data in the store, 
 *           and redirects the user to the home page.
 * 
 * Dependencies:
 * - auth: Imported from '@/models/auth', used to handle the logout process.
 * - this.$store: Vuex store instance, used to commit the 'setUser' mutation.
 * - this.$router: Vue Router instance, used to navigate to the home page.
 */
import auth from '@/models/auth'

export default {
  methods: {
    async logout() {
      await auth.logout()
      this.$store.commit('setUser', null)
      this.$router.push('/')
    }
  }
}
</script>
