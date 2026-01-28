<template>
  <v-app>
    <v-main>
     <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: auto;
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Vuetify root fix */
.v-application {
  min-height: 100vh !important;
}

.v-main {
  min-height: 100vh;
  overflow-y: auto;
}
</style>
