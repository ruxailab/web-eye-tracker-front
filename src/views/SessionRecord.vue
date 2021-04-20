<template>
  <div class="session">
    <v-toolbar dense dark>
        <v-toolbar-title>Eye Lab</v-toolbar-title>
        <v-spacer />
        <v-col cols="4" class="pt-9">
        <v-text-field solo dense light placeholder="URL" v-model="url"/>
        </v-col>
      <v-spacer />
      <v-toolbar-items>
        <v-row class="ma-0" align="center">
          <v-icon color="red" small>mdi-record</v-icon>
          <p class="pt-4 pr-4 pl-2">00:00:45</p>
          <v-btn icon small>
            <v-icon>mdi-stop-circle-outline</v-icon>
          </v-btn>
          <v-btn icon small>
            <v-icon>mdi-pause-circle-outline</v-icon>
          </v-btn>
          <v-btn icon small>
            <v-icon>mdi-play-circle-outline</v-icon>
          </v-btn>
        </v-row>
      </v-toolbar-items>
    </v-toolbar>
    <iframe
      :src="url"
      style="border: 0; width: 100%; height: 93%"
    />
  </div>
</template>

<script>
export default {
  name: "Session",
  data() {
      return {
          url: '',
      }
  }
};
</script>

<style scoped>
.session {
  height: 100%;
  overflow: hidden;
}
</style>
