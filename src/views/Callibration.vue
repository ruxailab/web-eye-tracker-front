<template>
  <div id="box">
    <Toolbar />
    <v-container class="mt-12">
      <v-row justify="center" align="start">
        <v-col cols="12" lg="5" md="5">
          <v-card outlined>
            <v-card-title>
              <v-icon left>mdi-information</v-icon>
              Calibration System
            </v-card-title>
            <p class="mx-4">
              The calibration works by associating the position of your eyes'
              iris with the coordinates of the circle on the screen.
              <br /><br />
              Before starting the process, turn on the camera and make sure your
              face and eyes are being captured by the model. After clicking
              start please don't leave the current position.
              <br /><br />
              Your task during the calibration is to follow the circles with
              your eyes. Try your best to not look away and to keep following.
              Blinking is fine.
            </p>
            <v-card-actions class="px-4 mt-12 mb-4">
              <v-btn block outlined color="green" @click="goToCameraConfig()">Start
                Calibration</v-btn>
              <!-- <v-btn block outlined color="green" :disabled="!isCameraOn" @click="goToCallibRecord()">Start
                Calibration</v-btn> -->
            </v-card-actions>
          </v-card>
        </v-col>
        <!-- <v-col cols="12" lg="7" md="7">
          <v-row justify="center" class="ma-0">
            <v-btn @click="setupCamera()" v-if="!isCameraOn" outlined color="blue">
              Turn camera on
              <v-icon right size="20">mdi-camera-outline</v-icon>
            </v-btn>
          </v-row>
          <div v-if="!isModelLoaded && isCameraOn">
            <v-row justify="center" class="mt-8" align="center">
              <v-progress-circular :size="50" :width="7" color="black" indeterminate></v-progress-circular>
              <h2 class="ml-4">Loading model...</h2>
            </v-row>
          </div>
          <div style="position:relative">
            <video autoplay id="video-tag" style="display: none"></video>
            <canvas id="canvas" width="600px" height="500px" style="position:absolute" />
            <v-img v-if="isModelLoaded" style="height: 500px; width: 600px; position:absolute" src="@/assets/mask_desktop.svg">
            </v-img>
          </div>
        </v-col> -->
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Toolbar from "@/components/Toolbar.vue";

export default {
  components: {
    Toolbar,
  },
  data() {
    return {
      isCameraOn: false,
      model: null,
      predictions: [],
      isModelLoaded: false,
      webcamStream: null,
    };
  },
  methods: {
    goToCameraConfig() {
      this.$router.push("/callibration/camera");
    },
  },
};
</script>
