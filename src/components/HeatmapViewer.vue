<template>
  <v-card>
    <v-toolbar dense dark>
      <v-spacer />
      <v-toolbar-items>
        <v-btn icon @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-btn @click="createHeatmap()"></v-btn>
    <v-row justify="center" class="ma-0">
      <div id="heatmap" class="heatmap-container" />
    </v-row>
  </v-card>
</template>

<script>
const h337 = require("heatmap.js");

export default {
  props: ['gaze_points'],
  methods: {
    createHeatmap() {
      const container = document.getElementById("heatmap");
      var heatmap = h337.create({
        container: container,
      });

      var points = [];
      var max = 1;
      // heatmap data format
        this.gaze_points.forEach(element => {
            points.push({
                x: Math.floor(Math.abs(element.x)),
                y: Math.floor(Math.abs(element.y)),
                value: 1,
            })
        });

      var data = {
        max: max,
        data: points,
      };
        console.log(data);
      heatmap.setData(data)
    },
  },
};
</script>

<style scoped>
.heatmap-container {
  background-color: gainsboro;
  height: 100vh;
  width: 90vw;
}
</style>
