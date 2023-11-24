<template>
  <div style="height: 100%;">
    <div v-if="!model" class="center-container">
      <v-progress-circular :size="80" :width="8" indeterminate color="black" class="loading-spinner"
        style="margin-bottom: 16px;"></v-progress-circular>
      <div>Loading model...</div>
    </div>
    <div v-else>
      <v-row justify="center" class="ma-0">
        <v-col v-if="callibFinished && currentStep === 1" cols="12" lg="4" md="4" sm="6">
          {{ circleIrisPoints.length }}
          <v-btn block outlined color="primary" @click="startValidation()">
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
    </div>
    <canvas id="canvas" />
    <video autoplay id="video-tag" style="display: none;"></video>
  </div>
</template>

<script>
const tf = require("@tensorflow/tfjs");
const faceLandmarksDetection = require("@tensorflow-models/face-landmarks-detection");

export default {
  data() {
    return {
      model: null,
      canvas: null,
      w: 0,
      h: 0,
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
  computed: {
    radius() {
      return this.$store.state.calibration.radius
    },
    offset() {
      return this.$store.state.calibration.offset
    },
    predByPointCount() {
      return this.$store.state.calibration.samplePerPoint
    },
    pattern() {
      return this.$store.state.calibration.pattern
    },
    backgroundColor() {
      return this.$store.state.calibration.backgroundColor
    },
    pointColor() {
      return this.$store.state.calibration.pointColor
    },
    isControlled() {
      return this.$store.state.calibration.isControlled
    },
  },
  watch: {
    predictions: {
      handler() {
        if (!this.isStop) this.detectFace();
      },
      deep: true,
    },
  },
  async mounted() {
    this.isControlled ? await this.controlledCalib(true) : await this.timedCallib(true);
  },
  methods: {
    async controlledCalib(isCalib) {
      console.log('this is controlled');
      if (this.index == 0) {
        this.generateCallibPoints();
        await this.startWebCamCapture();
      }
      const th = this;
      let intervalId = null;
      function keydownHandler(event) {
        if ((event.key === "s" || event.key === "S") && !intervalId) {
          let calibCount = 0;
          intervalId = setInterval(function () {
            isCalib ? th.savePoint(th.circleIrisPoints, true) : th.savePoint(th.calibPredictionPoints, false);
            isCalib ? console.log(th.circleIrisPoints) : console.log(th.calibPredictionPoints);
            calibCount++;
            if (calibCount === th.predByPointCount) {
              clearInterval(intervalId);
              intervalId = null;
              calibCount = 0;
              document.removeEventListener("keydown", keydownHandler);
              th.controlledCalib(isCalib);
            }
          }, 100);
        }
      }
      if (isCalib && (this.callibFinished && this.currentStep === 2)) {
        for (let i = 0; i < this.predByPointCount; i++) {
          this.circleIrisPoints.pop();
        }
      } else {
        document.addEventListener("keydown", keydownHandler);
        this.move();
      }
    },
    async timedCallib(isCalib) {
      console.log('this is timed');
      
    },
    async endCalib() {
      const screenHeight = window.screen.height;
      const screenWidth = window.screen.width;
      await this.$store.dispatch('sendData', { circleIrisPoints: this.circleIrisPoints, calibPredictionPoints: this.calibPredictionPoints, screenHeight: screenHeight, screenWidth: screenWidth })
      this.$store.dispatch('extractXYValues', { extract: this.circleIrisPoints, hasCalib: true })
      this.$store.dispatch('extractXYValues', { extract: this.calibPredictionPoints, hasCalib: false })
      this.$router.push('/postCalibration');
    },
    savePoint(whereToSave, isCalib) {
      if (!this.isStop) {
        if (this.predictions[0]) {
          const data = {
            left_iris_x: this.predictions[0].scaledMesh[468]["0"],
            left_iris_y: this.predictions[0].scaledMesh[468]["1"],
            right_iris_x: this.predictions[0].scaledMesh[473]["0"],
            right_iris_y: this.predictions[0].scaledMesh[473]["1"],
          }
          if (isCalib) {
            data.point_x = this.callibPoints[this.index - 1].x;
            data.point_y = this.callibPoints[this.index - 1].y;
          }
          whereToSave.push({
            ...data
          });
        } else {
          console.log('sorry no predictions')
        }
      } else {
        console.log('sorry, it has stopped')
      }
    },
    // canvas related
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
    async startValidation() {
      this.model = null
      this.currentStep = 2;
      this.isStop = false;
      this.index = 0;
      this.canvas.style.display = "block";
      this.isControlled ? await this.controlledCalib(false) : await this.timedCallib(false);
    },
    move() {
      if (this.index == this.callibPoints.length) {
        this.stopRecord();
        this.isStop = true;
        if (this.calibPredictionPoints.length == (this.predByPointCount * this.callibPoints.length)) {
          this.calibPredictionEnded = true
        }
        return;
      }
      this.ctx.clearRect(0, 0, this.w, this.h);
      // background
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(0, 0, this.w, this.h);

      // outer circle
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.pointColor;
      this.ctx.fillStyle = this.pointColor;
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
      this.callibPoints = this.pattern
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

.center-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
