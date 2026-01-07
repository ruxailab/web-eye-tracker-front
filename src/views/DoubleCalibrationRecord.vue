<template>
  <div style="height: 100%;">
    <div v-if="!model" class="center-container">
      <v-progress-circular :size="80" :width="8" indeterminate color="black" class="loading-spinner"
        style="margin-bottom: 16px;"></v-progress-circular>
      <div>Loading model...</div>
    </div>
    <!-- loading case ^ -->

    <div v-else>
      <!-- Progress indicator -->
      <div class="calibration-header">
        <div class="progress-container">
          <div class="progress-text">
            <span class="step-label">{{ currentStep === 1 ? 'Training Phase' : 'Validation Phase' }}</span>
            <span class="point-counter">Point {{ index + 1 }} / {{ usedPattern.length }}</span>
          </div>
          <v-progress-linear 
            :value="(index / usedPattern.length) * 100" 
            color="green" 
            height="6" 
            rounded
            class="mt-2"
          ></v-progress-linear>
        </div>
      </div>

      <!-- Collecting indicator -->
      <div v-if="isCollecting" class="collecting-indicator">
        <v-progress-circular indeterminate color="green" size="24" width="3" class="mr-2"></v-progress-circular>
        <span>Recording eye position...</span>
      </div>

      <v-row justify="center" align="center" class="ma-0 justify-center align-center">
        <!-- Initial instruction -->
        <div v-if="index === 0" class="instruction-box">
          <v-icon size="48" color="green" class="mb-3">mdi-eye-outline</v-icon>
          <h2 class="instruction-title">Look at the red dot</h2>
          <p class="instruction-text">Press <kbd>S</kbd> when ready to start recording</p>
          <p class="instruction-subtext">Keep your head still and follow each point with your eyes</p>
        </div>
        
        <!-- Last point instruction -->
        <div v-if="index === usedPattern.length - 1 && index > 0" class="instruction-box-small">
          <p class="instruction-text-small">Final point! Press <kbd>S</kbd> once more</p>
        </div>
        
        <!-- Collection complete -->
        <div v-if="index === usedPattern.length" class="completion-box">
          <v-icon size="64" color="green" class="mb-4">mdi-check-circle</v-icon>
          <div v-if="currentStep === 1">
            <h2 class="completion-title">Training Complete!</h2>
            <p class="completion-text">Collected {{ circleIrisPoints.length }} training samples</p>
            <p class="completion-subtext">Now let's validate the calibration</p>
            <v-btn large color="green" @click="nextStep()" class="mt-4">
              <v-icon left>mdi-arrow-right</v-icon>
              Continue to Validation
            </v-btn>
          </div>
          <div v-else>
            <h2 class="completion-title">Validation Complete!</h2>
            <p class="completion-text">Collected {{ calibPredictionPoints.length }} validation samples</p>
            <p class="completion-subtext">Processing your calibration data...</p>
            <v-btn large color="green" @click="endCalib()" class="mt-4">
              <v-icon left>mdi-check</v-icon>
              Finish Calibration
            </v-btn>
          </div>
        </div>
      </v-row>
    </div>
    <canvas id="canvas" style="z-index: 0;" />
    <video autoplay id="video-tag" style="display: none;"></video>
  </div>
</template>

<script>
import axios from 'axios';


export default {

  data() {
    return {
      // camera
      webcamfile: null,
      recordWebCam: null,
      configWebCam: {
        audio: false,
        video: true
      },

      // calibration
      circleIrisPoints: [],
      calibPredictionPoints: [],
      calibFinished: false,
      currentStep: 1,
      animationRefreshRate: 10,
      animationFrames: 250,
      innerCircleRadius: 5,
      usedPattern: [],
      fromRuxailab: false,
      isCollecting: false
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
    mockPattern() {
      return this.$store.state.calibration.mockPattern
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
  async created() {
    await this.verifyFromRuxailab()
    this.$store.commit('setIndex', 0)
    this.usedPattern = (this.mockPattern.length > 0) ? this.mockPattern : this.pattern

    if (this.usedPattern.length === 0) {
      const width = window.innerWidth
      const height = window.innerHeight
      const offset = this.offset || 100

      const cols = 3
      const rows = 3

      const usableWidth = width - 2 * offset
      const usableHeight = height - 2 * offset

      const stepX = usableWidth / (cols - 1)
      const stepY = usableHeight / (rows - 1)

      const generatedPattern = []

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          generatedPattern.push({
            x: offset + j * stepX,
            y: offset + i * stepY,
          })
        }
      }

      this.$store.commit('setMockPattern', generatedPattern)
      this.usedPattern = generatedPattern

    }
    await this.startWebCamCapture();
    this.drawPoint(this.usedPattern[0].x, this.usedPattern[0].y, 1)
    this.advance(this.usedPattern, this.circleIrisPoints, this.msPerCapture)
  },
  methods: {
    advance(pattern, whereToSave, timeBetweenCaptures) {
      const th = this
      var i = 0
      async function keydownHandler(event) {
        if ((event.key === "s" || event.key === "S")) {
          if (i <= pattern.length - 1) {
            document.removeEventListener('keydown', keydownHandler)
            th.isCollecting = true
            await th.extract(pattern[i], timeBetweenCaptures)
            th.isCollecting = false

            th.$store.commit('setIndex', i)
            i++
            if (i != pattern.length) {
              await th.triggerAnimation(pattern[i - 1], pattern[i], this.animationRefreshRate)
            }
            document.addEventListener('keydown', keydownHandler)
          } else {
            th.$store.commit('setIndex', i)
            document.removeEventListener('keydown', keydownHandler)
            th.savePoint(whereToSave, th.usedPattern)
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }
        }
      }
      document.addEventListener('keydown', keydownHandler)
    },
    nextStep() {
      this.usedPattern.forEach(element => {
        delete element.data;
      });
      this.$store.commit('setIndex', 0)
      this.currentStep = 2
      this.drawPoint(this.usedPattern[0].x, this.usedPattern[0].y, 1)
      this.advance(this.usedPattern, this.calibPredictionPoints, this.msPerCapture)
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
      const screenHeight = window.screen.height;
      const screenWidth = window.screen.width;
      var predictions =
        await this.$store.dispatch('sendData', {
          fromRuxailab: this.fromRuxailab,
          circleIrisPoints: this.circleIrisPoints,
          calibPredictionPoints: this.calibPredictionPoints,
          screenHeight: screenHeight,
          screenWidth: screenWidth,
          k: this.$store.state.calibration.pointNumber,
          threshold: this.$store.state.calibration.threshold
        })

      if (typeof predictions === 'string') {
        predictions = predictions.replace(/NaN/g, '1');
        try {
          predictions = JSON.parse(predictions);
        } catch (error) {
          console.error('Error parsing predictions string:', error);
        }
      }
      for (var a = 0; a < this.usedPattern.length; a++) {
        const element = predictions[this.usedPattern[a].x.toString().split('.')[0]][this.usedPattern[a].y.toString().split('.')[0]]
        this.usedPattern[a].precision = element.PrecisionSD.toFixed(2)
        this.usedPattern[a].accuracy = element.Accuracy.toFixed(2)
        this.usedPattern[a].predictionX = element.predicted_x
        this.usedPattern[a].predictionY = element.predicted_y
      }
      this.$store.dispatch('extractXYValues', { extract: this.circleIrisPoints, hasCalib: true })
      this.$store.dispatch('extractXYValues', { extract: this.calibPredictionPoints, hasCalib: false })
      this.stopRecord()
      this.$store.commit('setMockPattern', [])
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
        });
    },

    async verifyFromRuxailab() {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('auth') && urlParams.has('test')) {
        this.fromRuxailab = true
        await this.getRuxailabConfig(urlParams.get('auth'), urlParams.get('test'));
      }
    },

    async getRuxailabConfig(userId, testId) {
      const { data } = await axios.get(
        `${process.env.VUE_APP_RUXAILAB_URL}/getCalibrationConfig`,
        { params: { testId } }
      );

      const calibrationConfig = data.calibrationConfig;

      this.$store.commit('setCalibrationConfig', calibrationConfig);
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
  font-size: 18px;
  color: #333;
}

/* Calibration Header */
.calibration-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  backdrop-filter: blur(10px);
}

.progress-container {
  max-width: 600px;
  margin: 0 auto;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.step-label {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.point-counter {
  font-size: 14px;
  font-weight: 500;
  color: #4caf50;
  background: #e8f5e9;
  padding: 4px 12px;
  border-radius: 12px;
}

/* Collecting indicator */
.collecting-indicator {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(76, 175, 80, 0.95);
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
  z-index: 99;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
  }
  50% {
    box-shadow: 0 4px 24px rgba(76, 175, 80, 0.6);
  }
}

/* Instruction boxes */
.instruction-box {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.97);
  padding: 32px 48px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  text-align: center;
  z-index: 10;
  max-width: 500px;
  backdrop-filter: blur(10px);
}

.instruction-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.instruction-text {
  font-size: 18px;
  color: #555;
  margin-bottom: 8px;
}

.instruction-subtext {
  font-size: 14px;
  color: #888;
  font-style: italic;
}

.instruction-box-small {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.instruction-text-small {
  font-size: 16px;
  color: #555;
  margin: 0;
  font-weight: 500;
}

/* Completion box */
.completion-box {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.98);
  padding: 48px 64px;
  border-radius: 20px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
  text-align: center;
  z-index: 10;
  max-width: 600px;
  backdrop-filter: blur(10px);
}

.completion-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
}

.completion-text {
  font-size: 18px;
  color: #555;
  margin-bottom: 8px;
}

.completion-subtext {
  font-size: 14px;
  color: #888;
  margin-bottom: 16px;
}

/* Keyboard key styling */
kbd {
  background: #f4f4f4;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  font-family: monospace;
  font-weight: 600;
  font-size: 16px;
  color: #333;
}
</style>
