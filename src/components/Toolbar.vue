<template>
  <v-app-bar dark dense>
    <div @click="$router.push('/')" style="cursor:pointer">
      <v-app-bar-title>Eye Lab</v-app-bar-title>
    </div>
    <v-spacer />
    <v-btn text dark to="/">
      Home
    </v-btn>
    <v-btn text dark to="/about" v-if="$route.name != 'About'">
      About
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
import auth from '@/models/auth'

export default {
  methods: {
    logout() {
      auth.logout()
      this.$store.commit('setUser', null)
    }
  }
}
</script>
