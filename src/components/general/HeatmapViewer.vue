<template>
  <v-card id="card">
    <div class="video-view">
      <video autoplay class="video-container" id="video" />
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
        <div style="width:200vh">
          <v-row justify="center" class="mt-5">
            <v-btn
            class="mt-4"
              @click="createHeatmap()"
              v-if="!isplay"
              color="green"
              outlined
              >Play Session Result
              <v-icon righ>mdi-play</v-icon>
            </v-btn>
          </v-row>
        </div>
      </div>
      <div class="heatmap-container">
        <div id="heatmap" />
      </div>
    </div>
  </v-card>
</template>

<script>
const h337 = require("heatmap.js");

export default {
  props: ["gaze_points", "screen_record"],
  data() {
    return {
      isplay: false,
    };
  },
  methods: {
    async createHeatmap() {
      this.isplay = true;
      document.getElementById("video").src = URL.createObjectURL(
        this.screen_record
      );
      const elem = document.getElementById("card");
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen();
      }

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
  background-color: rgba(255, 255, 255, 0.1);
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
