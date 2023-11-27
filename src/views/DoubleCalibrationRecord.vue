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
export default {
  data() {
    return {
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
    leftEyeTreshold() {
      return this.$store.state.calibration.leftEyeTreshold
    },
    rightEyeTreshold() {
      return this.$store.state.calibration.rightEyeTreshold
    },
    model: {
      get() {
        return this.$store.state.detect.model
      },
      set() { }
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
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    await this.startWebCamCapture();
    this.advance(this.pattern)
  },
  methods: {
    advance(pattern) {
      const th = this
      var i = 0
      function keydownHandler(event) {
        if ((event.key === "s" || event.key === "S")) {
          if (i <= pattern.length - 1) {
            th.drawAndExtract(pattern[i])
            i++
          } else {
            console.log('enough bruh')
            document.removeEventListener('keydown', keydownHandler)
          }
        }
      }
      document.addEventListener('keydown', keydownHandler)
    },

    async drawAndExtract(point) {
      point.data = []
      this.drawPoint(point.x, point.y)
      for (var a = 0; a < this.predByPointCount;) {
        const prediction = await this.detectFace()
        const pred = prediction[0]
        // left eye
        const leftIris = pred.annotations.leftEyeIris;
        const leftEyelid = pred.annotations.leftEyeUpper0.concat(pred.annotations.leftEyeLower0);
        const leftEyelidTip = leftEyelid[3]
        const leftEyelidBottom = leftEyelid[11]
        const isLeftBlink = this.calculateDistance(leftEyelidTip, leftEyelidBottom) < this.leftEyeTreshold
        // right eye
        const rightIris = pred.annotations.rightEyeIris;
        const rightEyelid = pred.annotations.rightEyeUpper0.concat(pred.annotations.rightEyeLower0);
        const rightEyelidTip = rightEyelid[3]
        const rightEyelidBottom = rightEyelid[11]
        const isRightBlink = this.calculateDistance(rightEyelidTip, rightEyelidBottom) < this.rightEyeTreshold

        if (isLeftBlink || isRightBlink) {
          console.log('i wont do it')
        } else {
          const prediction = { leftIris: leftIris, rightIris: rightIris }
          point.data.push(prediction)
          console.log(a)
          console.log(point.data)
          a++
        }
      }
    },
    calculateDistance(eyelidTip, eyelidBottom) {
      const xDistance = eyelidBottom[0] - eyelidTip[0];
      const yDistance = eyelidBottom[1] - eyelidTip[1];
      const distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
      return distance;
    },
    drawPoint(x, y) {
      const canvas = document.getElementById('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, this.w, this.h)
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, 0, this.w, this.h);

      ctx.beginPath();
      ctx.strokeStyle = this.pointColor;
      ctx.fillStyle = this.pointColor;
      ctx.arc(
        x,
        y,
        this.radius,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.fillStyle = "red";
      ctx.arc(
        x,
        y,
        5,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke();
      ctx.fill();
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
            mimeType: "video/webm;",
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

          // Init record webcam
          this.recordWebCam.start();
          video.onloadeddata = () => {
            this.detectFace();
          }
        })
        .catch((e) => {
          console.error("Error", e);
          this.stopRecord();
        });
    },
    async detectFace() {
      const lastPrediction = this.predictions = await this.model.estimateFaces({
        input: document.getElementById("video-tag"),
      });
      return lastPrediction
    },
    stopRecord() {
      this.recordWebCam.state != "inactive" ? this.stopWebCamCapture() : null;
    },
    async stopWebCamCapture() {
      await this.recordWebCam.stop();
      this.callibFinished = true;
      this.canvas.style.display = "none";
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
