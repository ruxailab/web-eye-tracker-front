<template>
  <v-row justify="center">
    <div class="container">
      <h2 class="text-center pb-12">Analyzing the sample</h2>
      <v-progress-linear
        v-model="responseStatus.value"
        height="25"
        dark
        color="black"
        class="mt-8"
      >
        <strong>{{ responseStatus.value }}%</strong>
      </v-progress-linear>
      <p class="subtitle-1">{{ responseStatus.message }}</p>
    </div>
  </v-row>
</template>

<script>
export default {
  computed: {
    responseStatus() {
      return this.$store.state.session.responseStatus;
    },
  },
  created() {
    this.$store.dispatch('checkResponseStatus')
  },
};
</script>

<style scoped>
.container {
  position: fixed;
  top: 35%;
}
</style>
