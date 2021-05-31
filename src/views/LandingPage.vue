<template>
  <div
    class="bg"
    :style="{ backgroundImage: 'url(' + require('@/assets/eye.jpg') + ')' }"
  >
    <invisible-toolbar />
    <v-row justify="end" class="mt-12">
      <v-col cols="12" lg="6" md="4">
        <h1 class="white--text text-end mx-12">Eye Lab</h1>
        <p class="white--text mt-12 text-end mx-12" style="font-size:20px">{{ desc }}</p>
        <v-row justify="end" class="mx-12 mt-12">
        <v-btn dark outlined class="mt-12" to="/dashboard">get started</v-btn>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import InvisibleToolbar from "@/components/InvisibleToolbar.vue";

export default {
  components: {
    InvisibleToolbar,
  },
  data() {
      return {
          desc: 'An open source and free tool for creating usability tests using only your eyes and your webcam'
      }
  }
};
</script>

<style scoped>
.bg {
  height: 100%;
  background-position: 100%;
  background-repeat: no-repeat;
  background-size: 130%;
  box-shadow: inset 0 0 0 50vw rgba(0, 0, 0, 0.5);
}
</style>
