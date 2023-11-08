<template>
  <div id="box" style="text-align: center;">
    <v-col>
      <div v-if="!isModelLoaded && isCameraOn" class="loading-container">
        <v-progress-circular :size="50" :width="7" color="black" indeterminate></v-progress-circular>
        <h2 class="ml-4">Loading model...</h2>
      </div>

      <div style="position: relative; display: flex; justify-content: center; align-items: center;">
        <video autoplay id="video-tag" style="width: 100%; height: 100%;"></video>
        <canvas id="canvas" width="600" height="500"
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
        <v-img v-if="isModelLoaded" style="width: 100%; height: 100%; position: absolute;"
          src="@/assets/mask_desktop.svg">
        </v-img>
      </div>
    </v-col>
  </div>
</template>

<script>
const tf = require("@tensorflow/tfjs");
const faceLandmarksDetection = require("@tensorflow-models/face-landmarks-detection");

export default {
  data() {
    return {
      isCameraOn: false,
      model: null,
      predictions: [],
      isModelLoaded: false,
      webcamStream: null,
    };
  },
  watch: {
    predictions: {
      handler() {
        this.detectFace();
      },
      deep: true,
    },
  },
  mounted() {
    this.setupCamera()
  },
  methods: {
    setupCamera() {
      let video = document.getElementById("video-tag");
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: { width: 600, height: 500 },
        })
        .then(async (stream) => {
          // stream is a MediaStream object
          video.srcObject = stream;
          this.isCameraOn = true;

          this.webcamStream = stream;

          await tf.getBackend();
          // Load the faceLandmarksDetection model assets.
          this.model = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
          );

          this.isModelLoaded = true;
          this.detectFace();
        });
    },
    async detectFace() {
      let video = document.getElementById("video-tag");
      let canvas = document.getElementById("canvas");
      let ctx = canvas.getContext("2d");

      this.predictions = await this.model.estimateFaces({
        input: document.getElementById("video-tag"),
      });

      // draw the video first
      ctx.drawImage(video, 0, 0, 600, 500);
      this.predictions.forEach((pred) => {
        // draw the rectangle enclosing the face
        ctx.fillStyle = "red";

        // left iris
        ctx.fillRect(
          pred.scaledMesh[468]["0"],
          pred.scaledMesh[468]["1"],
          5,
          5
        );

        // right iris
        ctx.fillRect(
          pred.scaledMesh[473]["0"],
          pred.scaledMesh[473]["1"],
          5,
          5
        );

        // face contour
        ctx.beginPath();
        ctx.lineWidth = "4";
        ctx.strokeStyle = "blue";
        ctx.rect(
          pred.boundingBox.topLeft[0],
          pred.boundingBox.topLeft[1],
          pred.boundingBox.bottomRight[0] - pred.boundingBox.topLeft[0],
          pred.boundingBox.bottomRight[1] - pred.boundingBox.topLeft[1]
        );
        ctx.stroke();
      });
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
</style>