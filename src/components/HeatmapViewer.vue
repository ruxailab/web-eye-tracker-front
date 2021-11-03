<template>
  <v-card>
    <div class="video-view">
      <video controls class="video-container">
        <source src="a" />
      </video>      
      <div class="video-content">
        <v-btn
          icon
          @click="$emit('close')"
          fixed
          absolute
          top
          right
          color="red"
          class="mr-4"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn @click="createHeatmap()">show</v-btn>
      </div>
      <div class="heatmap-container">
          <div id="heatmap"/>
      </div>
    </div>
  </v-card>
</template>

<script>
const h337 = require("heatmap.js");

export default {
  props: ["gaze_points"],
  methods: {
    createHeatmap() {
      const container = document.getElementById("heatmap");
      var heatmap = h337.create({
        container: container,
      });

      var points = [];
      var max = 1;
      // heatmap data format
      this.gaze_points.forEach((element) => {
        points.push({
          x: Math.floor(Math.abs(element.x)),
          y: Math.floor(Math.abs(element.y)),
          value: 1,
        });
      });

      var data = {
        max: max,
        data: points,
      };
      console.log(data);
      heatmap.setData(data);
    },
  },
};
</script>

<style scoped>
#heatmap {
    height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.heatmap-container {
  height: 100vh;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  background-color: rgba(255, 255, 255, 0.1)
}

.video-container {
  height: 100vh;
  width: 100%;
}
.video-view {
  position: relative;
  width: 100%;
  height: 100px;
}

.video-view .video-content {
  position: absolute;
  bottom: 0px;
  z-index: 2;
}
</style>
