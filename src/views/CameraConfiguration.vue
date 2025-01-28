<template>
    <div id="box" style="text-align: center;">
      <!-- Toolbar component for navigation or general utility -->
      <Toolbar />
  
      <!-- Main container -->
      <v-container class="mt-12">
        <v-row justify="center">
          <!-- BlinkThresholdCard component (likely for threshold settings) -->
          <v-col>
            <BlinkTresholdCard />
          </v-col>
  
          <!-- Video, canvas, and controls -->
          <v-col cols="12" lg="7" md="7">
            <div id="box" style="text-align: center;">
              <v-col>
                <!-- Video streaming and model loading states -->
                <div v-if="isModelLoaded" style="position: relative; display: flex; justify-content: center; align-items: center;">
                  <video autoplay id="video-tag" style="transform: scaleX(-1)" />
                  <canvas id="canvas" width="600" height="500" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: scaleX(-1)" />
                  <!-- Overlay image -->
                  <v-img v-if="isCameraOn" style="width: 100%; height: 100%; position: absolute;" src="@/assets/mask_desktop.svg" />
                </div>
                <!-- Loading indicator -->
                <div v-else class="loading-container">
                  <v-progress-circular :size="50" :width="7" color="black" indeterminate></v-progress-circular>
                  <h2 class="ml-4">Loading model...</h2>
                </div>
              </v-col>
            </div>
  
            <!-- Button for starting calibration -->
            <v-btn class="calibration-btn" outlined color="green" :disabled="!isCameraOn" @click="goToCalibRecord()">
              Start Calibration
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </template>
  
<script>
import Toolbar from "@/components/general/Toolbar.vue"; // Toolbar component
import BlinkTresholdCard from "@/components/calibration/BlinkTresholdCard.vue"; // Threshold settings component
const tf = require("@tensorflow/tfjs"); // TensorFlow.js library
const faceLandmarksDetection = require("@tensorflow-models/face-landmarks-detection"); // Face landmarks detection model
require('@tensorflow/tfjs-backend-wasm'); // WASM backend for TensorFlow.js

export default {
  components: {
    Toolbar,
    BlinkTresholdCard,
  },
  data() {
    return {
      isCameraOn: false, // Tracks camera state
      webcamStream: null, // MediaStream object for webcam
      video: null, // Reference to the video element
    };
  },
  computed: {
    // Computed properties for model, predictions, and thresholds
    model() {
      return this.$store.state.detect.model;
    },
    isModelLoaded() {
      return this.$store.state.detect.loaded;
    },
    predictions() {
      return this.$store.state.detect.predictions;
    },
    blinkFilter() {
      return this.$store.state.calibration.blinkFilter;
    },
    leftEyeTreshold() {
      return this.$store.state.calibration.leftEyeTreshold;
    },
    rightEyeTreshold() {
      return this.$store.state.calibration.rightEyeTreshold;
    },
  },
  watch: {
    predictions: {
      // Watcher to trigger face detection when predictions change
      handler() {
        this.detectFace();
      },
      deep: true,
    },
  },
  mounted() {
    // Called when the component is mounted; initializes the camera
    this.setupCamera();
  },
  methods: {
    async setupCamera() {
      /**
       * Initializes the webcam and loads the face landmarks model.
       */
      const model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
        { maxFaces: 1 }
      );
      this.$store.commit('setModel', model);
      this.$store.commit('setLoaded', (model != null));

      this.$nextTick(() => {
        this.video = document.getElementById("video-tag");

        navigator.mediaDevices
          .getUserMedia({
            audio: false,
            video: { width: 600, height: 500 },
          })
          .then((stream) => {
            this.video.srcObject = stream;
            this.webcamStream = stream;
            tf.getBackend();

            this.video.onloadeddata = () => {
              this.isCameraOn = true;
              this.detectFace();
            };
          });
      });
    },
    async detectFace() {
      /**
       * Performs face detection on the webcam feed and draws overlays.
       */
      let canvas = document.getElementById("canvas");
      let ctx = canvas.getContext("2d");
      let prediction = await this.model.estimateFaces({ input: this.video });
      this.$store.commit('setPredictions', prediction);
      ctx.drawImage(this.video, 0, 0, 600, 500);

      this.predictions.forEach((pred) => {
        // Process left and right eyes
        this.processEye(pred, 'left', ctx);
        this.processEye(pred, 'right', ctx);
        this.drawFace(ctx, pred); // Draw face bounding box
      });
    },
    processEye(pred, eye, ctx) {
      /**
       * Processes eye landmarks and checks for blinks.
       * @param {Object} pred - The prediction object.
       * @param {string} eye - 'left' or 'right'.
       * @param {CanvasRenderingContext2D} ctx - Canvas context.
       */
      const iris = pred.annotations[`${eye}EyeIris`];
      const eyelid = pred.annotations[`${eye}EyeUpper0`].concat(pred.annotations[`${eye}EyeLower0`]);
      const eyelidTip = eyelid[3];
      const eyelidBottom = eyelid[11];
      const isBlink = this.calculateDistance(eyelidTip, eyelidBottom) < this[`${eye}EyeTreshold`];
      this.blinkFilter ? this.drawEye(iris, eyelid, ctx, isBlink) : this.drawEye(iris, eyelid, ctx, false);
    },
    calculateDistance(pt1, pt2) {
      /**
       * Calculates Euclidean distance between two points.
       */
      const xDistance = pt2[0] - pt1[0];
      const yDistance = pt2[1] - pt1[1];
      return Math.sqrt(xDistance ** 2 + yDistance ** 2);
    },
    drawEye(iris, eyelid, ctx, isBlink) {
      /**
       * Draws the eye landmarks on the canvas.
       */
      ctx.fillStyle = isBlink ? 'red' : 'yellow';
      eyelid.forEach(([x, y]) => ctx.fillRect(x, y, 3, 3));
      ctx.fillStyle = 'blue';
      ctx.fillRect(iris[0][0], iris[0][1], 3, 3);
    },
    drawFace(ctx, pred) {
      /**
       * Draws a bounding box around the detected face.
       */
      ctx.beginPath();
      ctx.lineWidth = "4";
      ctx.strokeStyle = "blue";
      const [topLeft, bottomRight] = [pred.boundingBox.topLeft, pred.boundingBox.bottomRight];
      ctx.rect(topLeft[0], topLeft[1], bottomRight[0] - topLeft[0], bottomRight[1] - topLeft[1]);
      ctx.stroke();
    },
    goToCalibRecord() {
      /**
       * Stops the webcam and navigates to the calibration page.
       */
      this.webcamStream.getTracks().forEach((track) => track.stop());
      this.$router.push("/calibration/record");
    },
  },
};
</script>
  
<style scoped>
.loading-container {
    text-align: center;
    margin-top: 8rem;
}

.centered-canvas {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.calibration-btn {
    max-width: 200px;
    height: 30px;
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
}

#video-tag {
    width: 100%;
    height: 100%;
}
</style>