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
    <v-btn text dark class="mr-4" to="/login" v-if="$route.name != 'Login'">
      Login
      <v-icon right>mdi-login</v-icon>
    </v-btn>
  </v-app-bar>
</template>
