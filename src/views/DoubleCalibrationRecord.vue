<template>
  <div style="height: 100%;">
    <div v-if="!model" class="center-container">
      <v-progress-circular :size="80" :width="8" indeterminate color="black" class="loading-spinner"
        style="margin-bottom: 16px;"></v-progress-circular>
      <div>Loading model...</div>
    </div>
    <!-- loading case ^ -->

    <div v-else>
      <v-row justify="center" align="center" class="ma-0 justify-center align-center">
        <div v-if="index === 0" class="text-center"
          style="z-index: 1;position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
          slowly press 'S' while looking at the point to begin
        </div>
        <div v-if="index === pattern.length - 1" class="text-center"
          style="z-index: 1;position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"> press 'S' one
          more time</div>
        <div v-if="index === pattern.length" class="text-center" style="z-index: 1;">
          <div v-if="currentStep === 1"
            style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
            <div>
              you've collected {{ circleIrisPoints.length }} train points
            </div>
            <v-btn @click="nextStep()">Next Step</v-btn>
          </div>
          <div v-else style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
            <div>
              you've collected {{ calibPredictionPoints.length }} validation points
            </div>
            <v-btn @click="endCalib()">End Calib</v-btn>
          </div>
        </div>
      </v-row>
    </div>
    <canvas id="canvas" style="z-index: 0;" />
    <video autoplay id="video-tag" style="display: none;"></video>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // camera
      webcamfile: null,
      recordWebCam: null,
      configWebCam: {
        audio: false,
        video: {
          width: 1536,
          height: 864,
        },
      },

      // cablibration
      circleIrisPoints: [],
      calibPredictionPoints: [],
      calibFinished: false,
      currentStep: 1,
      animationRefreshRate: 10,
      animationFrames: 250,
      innerCircleRadius: 5,
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
    index() {
      return this.$store.state.calibration.index
    },
    msPerCapture() {
      return this.$store.state.calibration.msPerCapture
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
  async mounted() {
    await this.startWebCamCapture();
    this.drawPoint(this.pattern[0].x, this.pattern[0].y, 1)
    this.advance(this.pattern, this.circleIrisPoints, this.msPerCapture)
  },
  methods: {
    advance(pattern, whereToSave, timeBetweenCaptures) {
      const th = this
      var i = 0
      async function keydownHandler(event) {
        if ((event.key === "s" || event.key === "S")) {
          if (i <= pattern.length - 1) {
            document.removeEventListener('keydown', keydownHandler)
            await th.extract(pattern[i], timeBetweenCaptures)
            th.$store.commit('setIndex', i)
            i++
            if (i != pattern.length) {
              await th.triggerAnimation(pattern[i - 1], pattern[i], this.animationRefreshRate)
            }
            document.addEventListener('keydown', keydownHandler)
          } else {
            th.$store.commit('setIndex', i)
            document.removeEventListener('keydown', keydownHandler)
            th.savePoint(whereToSave, th.pattern)
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }
        }
      }
      document.addEventListener('keydown', keydownHandler)
    },
    nextStep() {
      this.pattern.forEach(element => {
        delete element.data;
      });
      this.$store.commit('setIndex', 0)
      this.currentStep = 2
      this.drawPoint(this.pattern[0].x, this.pattern[0].y, 1)
      this.advance(this.pattern, this.calibPredictionPoints, this.msPerCapture)
    },
    async extract(point, timeBetweenCaptures) {
      point.data = [];
      for (var a = 0; a < this.predByPointCount;) {
        const prediction = await this.detectFace();
        const pred = prediction[0];
        // left eye
        const leftIris = pred.annotations.leftEyeIris;
        const leftEyelid = pred.annotations.leftEyeUpper0.concat(pred.annotations.leftEyeLower0);
        const leftEyelidTip = leftEyelid[3];
        const leftEyelidBottom = leftEyelid[11];
        const isLeftBlink = this.calculateDistance(leftEyelidTip, leftEyelidBottom) < this.leftEyeTreshold;
        // right eye
        const rightIris = pred.annotations.rightEyeIris;
        const rightEyelid = pred.annotations.rightEyeUpper0.concat(pred.annotations.rightEyeLower0);
        const rightEyelidTip = rightEyelid[3];
        const rightEyelidBottom = rightEyelid[11];
        const isRightBlink = this.calculateDistance(rightEyelidTip, rightEyelidBottom) < this.rightEyeTreshold;

        if (isLeftBlink || isRightBlink) {
          console.log('eyes closed, disconsidered');
          // set timer so that when eyes open it doesnt select the unstable values
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          const newPrediction = { leftIris: leftIris[0], rightIris: rightIris[0] };
          point.data.push(newPrediction);
          const radius = (this.radius / this.predByPointCount) * a
          this.drawPoint(point.x, point.y, radius)
          a++;
        }
        await new Promise(resolve => setTimeout(resolve, timeBetweenCaptures));
      }
    },
    async triggerAnimation(origin, target, animationRefreshRate) {
      const frames = this.animationFrames
      const deltaX = (target.x - origin.x) / frames;
      const deltaY = (target.y - origin.y) / frames;

      for (let d = 1; d <= frames; d++) {
        const xPosition = origin.x + deltaX * d;
        const yPosition = origin.y + deltaY * d;
        if (d == frames) {
          this.drawPoint(xPosition, yPosition, 1);
        } else {
          const radius = (this.radius / frames) * (frames - d)
          this.drawPoint(xPosition, yPosition, radius);
        }
        await new Promise(resolve => setTimeout(resolve, animationRefreshRate));
      }
    },
    calculateDistance(eyelidTip, eyelidBottom) {
      const xDistance = eyelidBottom[0] - eyelidTip[0];
      const yDistance = eyelidBottom[1] - eyelidTip[1];
      const distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
      return distance;
    },
    drawPoint(x, y, radius) {
      const canvas = document.getElementById('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      //circle 
      ctx.beginPath();
      ctx.strokeStyle = this.pointColor;
      ctx.fillStyle = this.pointColor;
      ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke();
      ctx.fill();
      // inner circle
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.fillStyle = "red";
      ctx.arc(
        x,
        y,
        this.innerCircleRadius,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke();
      ctx.fill();
      // hollow circumference
      ctx.strokeStyle = this.pointColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, this.radius, 0, 2 * Math.PI, false);
      ctx.stroke();
    },
    async endCalib() {
      this.calibPredictionPoints.forEach(element => {
        delete element.point_x;
        delete element.point_y;
      })
      // const screenHeight = window.screen.height;
      // const screenWidth = window.screen.width;
      // await this.$store.dispatch('sendData', { circleIrisPoints: this.circleIrisPoints, calibPredictionPoints: this.calibPredictionPoints, screenHeight: screenHeight, screenWidth: screenWidth })
      this.$store.dispatch('extractXYValues', { extract: this.circleIrisPoints, hasCalib: true })
      this.$store.dispatch('extractXYValues', { extract: this.calibPredictionPoints, hasCalib: false })
      this.stopRecord()
      this.$router.push('/postCalibration');
    },
    savePoint(whereToSave, patternLike) {
      patternLike.forEach(point => {
        point.data.forEach(element => {
          const data = {
            left_iris_x: element.leftIris[0],
            left_iris_y: element.leftIris[1],
            right_iris_x: element.rightIris[0],
            right_iris_y: element.rightIris[1],
            point_x: point.x,
            point_y: point.y,
          }
          whereToSave.push(data)
        });
      });
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
      const lastPrediction = await this.model.estimateFaces({
        input: document.getElementById("video-tag"),
      });
      return lastPrediction
    },
    stopRecord() {
      this.recordWebCam.state != "inactive" ? this.stopWebCamCapture() : null;
    },
    async stopWebCamCapture() {
      await this.recordWebCam.stop();
      this.calibFinished = true;
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
