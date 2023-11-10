<template>
  <div style="height: 100%;">
    <v-row justify="center" class="ma-0">
      <v-col v-if="callibFinished && currentStep === 1" cols="12" lg="4" md="4" sm="6">
        {{ circleIrisPoints.length }}
        <v-btn block outlined color="primary" @click="nextStep()">
          Next Step
        </v-btn>
      </v-col>
      <div v-else-if="calibPredictionEnded && currentStep === 2">
        <v-row justify="center" class="mt-12 pt-12">
          {{ calibPredictionPoints.length }}
          <v-btn @click="endCalib()">End calib</v-btn>
        </v-row>
      </div>
    </v-row>
    <canvas id="canvas" />
    <video autoplay id="video-tag" style="display: none;"></video>
  </div>
</template>

<script>
// import axios from "axios";

const tf = require("@tensorflow/tfjs");
const faceLandmarksDetection = require("@tensorflow-models/face-landmarks-detection");

export default {
  data() {
    return {
      model: null,
      canvas: null,
      w: 0,
      h: 0,
      // interval: 5000,
      radius: 20,
      offset: 50,
      predByPointCount: 1,
      ctx: null,
      callibPoints: [],
      index: 0,
      webcamfile: null,
      recordWebCam: null,
      configWebCam: {
        audio: false,
        video: {
          width: 1536,
          height: 864,
        },
      },
      circleIrisPoints: [],
      callibFinished: false,
      predictions: [],
      isStop: false,
      currentStep: 1,
      calibPredictionEnded: false,
      calibPredictionPoints: [],
    };
  },
  watch: {
    predictions: {
      handler() {
        if (!this.isStop) this.detectFace();
      },
      deep: true,
    },
  },
  mounted() {
    this.startCallib();
  },
  methods: {
    startCallib() {
      this.generateCallibPoints();
      this.startWebCamCapture();

      const th = this;
      let intervalId = null;

      document.addEventListener("keydown", function (event) {
        if ((event.key === "s" || event.key === "S") && !intervalId) {
          let predCount = 0;
          intervalId = setInterval(function () {
            th.saveCircleIrisPoint();
            predCount++;
            if (predCount === th.predByPointCount) {
              clearInterval(intervalId);
              intervalId = null;
              predCount = 0;
              th.move();
            }
          }, 100);
        }
      });

      this.move();
    },
    async startWebCamCapture() {
      // Request permission for screen capture
      return navigator.mediaDevices
        .getUserMedia(this.configWebCam)
        .then(async (mediaStreamObj) => {
          // Create media recorder object
          this.recordWebCam = new MediaRecorder(mediaStreamObj, {
            mimeType: "video/webm; codecs=vp9",
          });
          let recordingWebCam = [];
          let video = document.getElementById("video-tag");
          video.srcObject = mediaStreamObj;

          // Define screen capture events

          // Save frames to recordingWebCam array
          this.recordWebCam.ondataavailable = (ev) => {
            recordingWebCam.push(ev.data);
          };

          // OnStop WebCam Record
          const th = this;
          this.recordWebCam.onstop = () => {
            // Generate blob from the frames
            let blob = new Blob(recordingWebCam, { type: "video/webm" });
            recordingWebCam = [];
            const uploadMediaWebCam = { blob: blob, name: mediaStreamObj.id };
            th.webcamfile = uploadMediaWebCam;

            // End webcam capture
            mediaStreamObj.getTracks().forEach((track) => track.stop());
            th.stopRecord();
          };

          // Start Tensorflow Model
          await tf.getBackend();
          // Load the faceLandmarksDetection model assets.
          this.model = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
            { maxFaces: 1 }
          );

          // Init record webcam
          this.recordWebCam.start();
          this.detectFace();
        })
        .catch((e) => {
          console.error("Error", e);
          this.stopRecord();
        });
    },
    async detectFace() {
      this.predictions = await this.model.estimateFaces({
        input: document.getElementById("video-tag"),
      });
    },
    stopRecord() {
      this.recordWebCam.state != "inactive" ? this.stopWebCamCapture() : null;
    },
    async stopWebCamCapture() {
      await this.recordWebCam.stop();
      this.callibFinished = true;
      this.canvas.style.display = "none";
    },
    nextStep() {
      this.currentStep = 2;
      this.isStop = false;
      this.index = 0;
      this.canvas.style.display = "block";
      this.generateCallibPoints();
      this.startWebCamCapture();
      this.movingCircleCalib();
    },
    movingCircleCalib() {
      let id;

      if (this.index == this.callibPoints.length) {
        this.stopRecord();
        cancelAnimationFrame(id);
        this.isStop = true;
        this.calibPredictionEnded = true;
        return;
      }

      this.ctx.clearRect(0, 0, this.w, this.h);

      // outer circle
      this.ctx.beginPath();
      this.ctx.strokeStyle = "black";
      this.ctx.fillStyle = "black";
      this.ctx.arc(
        this.callibPoints[this.index].x,
        this.callibPoints[this.index].y,
        this.radius,
        0,
        Math.PI * 2,
        false
      );
      this.ctx.stroke();
      this.ctx.fill();

      // inner circle
      this.ctx.beginPath();
      this.ctx.strokeStyle = "red";
      this.ctx.fillStyle = "red";
      this.ctx.arc(
        this.callibPoints[this.index].x,
        this.callibPoints[this.index].y,
        5,
        0,
        Math.PI * 2,
        false
      );
      this.ctx.stroke();
      this.ctx.fill();

      this.index++;
      // setTimeout(() => {
      const th = this;
      let intervalId = null;
      let predCount = 0;
      intervalId = setInterval(function () {
        th.saveCalibPredictPoint();
        predCount++;
        if (predCount === th.predByPointCount) {
          clearInterval(intervalId);
          intervalId = null;
          predCount = 0;
          th.movingCircleCalib()
        }
      }, 100);

      //   id = requestAnimationFrame(this.movingCircleCalib);
      // }, this.interval);
    },
    async endCalib() {
      this.saveFixed(this.circleIrisPoints)
      this.savePredict(this.calibPredictionPoints)
      // let formData = new FormData();
      // formData.append(
      //   "fixed_circle_iris_points",
      //   JSON.stringify(this.circleIrisPoints)
      // );
      // formData.append(
      //   "calib_circle_iris_points",
      //   JSON.stringify(this.calibPredictionPoints)
      // );
      // const res = await axios.post(`/api/session/calib_validation`, formData, {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // });
      // console.log(res);
    },
    saveFixed(data) {
      this.$store.commit('saveFixed', data)
    },
    savePredict(data) {
      this.$store.commit('savePredict', data)
    },
    saveCalibPredictPoint() {
      // set relation between eyes and circle x y
      if (!this.isStop) {
        if (this.predictions[0]) {
          this.calibPredictionPoints.push({
            left_iris_x: this.predictions[0].scaledMesh[468]["0"],
            left_iris_y: this.predictions[0].scaledMesh[468]["1"],
            right_iris_x: this.predictions[0].scaledMesh[473]["0"],
            right_iris_y: this.predictions[0].scaledMesh[473]["1"],
          });
        }
      }
    },
    saveCircleIrisPoint() {
      // set relation between eyes and circle x y
      if (!this.isStop) {
        if (this.predictions[0]) {
          this.circleIrisPoints.push({
            point_x: this.callibPoints[this.index - 1].x,
            point_y: this.callibPoints[this.index - 1].y,
            left_iris_x: this.predictions[0].scaledMesh[468]["0"],
            left_iris_y: this.predictions[0].scaledMesh[468]["1"],
            right_iris_x: this.predictions[0].scaledMesh[473]["0"],
            right_iris_y: this.predictions[0].scaledMesh[473]["1"],
          });
        }
      }
    },
    move() {
      if (this.index == this.callibPoints.length) {
        this.stopRecord();
        this.isStop = true;
        return;
      }

      this.ctx.clearRect(0, 0, this.w, this.h);

      // outer circle
      this.ctx.beginPath();
      this.ctx.strokeStyle = "black";
      this.ctx.fillStyle = "black";
      this.ctx.arc(
        this.callibPoints[this.index].x,
        this.callibPoints[this.index].y,
        this.radius,
        0,
        Math.PI * 2,
        false
      );
      this.ctx.stroke();
      this.ctx.fill();

      // inner circle
      this.ctx.beginPath();
      this.ctx.strokeStyle = "red";
      this.ctx.fillStyle = "red";
      this.ctx.arc(
        this.callibPoints[this.index].x,
        this.callibPoints[this.index].y,
        5,
        0,
        Math.PI * 2,
        false
      );
      this.ctx.stroke();
      this.ctx.fill();

      this.index++;
    },
    generateCallibPoints() {
      this.canvas = document.getElementById("canvas");
      this.w = this.canvas.width = window.innerWidth;
      this.h = this.canvas.height = window.innerHeight;
      this.ctx = this.canvas.getContext("2d");

      this.callibPoints = [
        { x: this.offset, y: this.offset },
        { x: this.offset, y: this.h / 2 },
        { x: this.offset, y: this.h - this.offset },

        { x: this.w / 2, y: this.offset },
        { x: this.w / 2, y: this.h / 2 },
        { x: this.w / 2, y: this.h - this.offset },

        { x: this.w - this.offset, y: this.offset },
        { x: this.w - this.offset, y: this.h / 2 },
        { x: this.w - this.offset, y: this.h - this.offset },

      ];

    },
  },
};
</script>

<style scoped>
body,
html {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
