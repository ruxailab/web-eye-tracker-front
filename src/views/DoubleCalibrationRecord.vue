<template>
  <div style="height: 100%; position: relative;">
    <!-- Loading state: Shows spinner while model is loading -->
    <div v-if="!model" class="center-container">
      <v-progress-circular :size="80" :width="8" indeterminate color="black" class="loading-spinner"
        style="margin-bottom: 16px;"></v-progress-circular>
      <div>Loading model...</div>
    </div>

    <!-- Calibration process steps -->
    <div v-else>
      <v-row justify="center" align="center" class="ma-0 justify-center align-center" style="position: relative;">

        <!-- Instructions for each calibration step -->
        <div v-if="index === 0" class="text-center"
          style="position: absolute; top: 35%; left: 50%; transform: translate(-50%, -50%); z-index: 1;">
          Slowly press 'S' while looking at the point to begin
        </div>

        <div v-if="index === usedPattern.length - 1" class="text-center"
          style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); z-index: 1;">
          Press 'S' one more time
        </div>

        <div v-if="index === usedPattern.length" class="text-center" style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); z-index: 1;">
          <div v-if="currentStep === 1">
            You've collected {{ circleIrisPoints.length }} train points
          </div>
          <v-btn @click="endCalib()">End Calibration</v-btn>
        </div>
        
      </v-row>
    </div>

    <!-- Canvas for drawing points and video for webcam feed -->
    <canvas id="canvas" style="position: absolute; z-index: 0;"></canvas>
    <video autoplay id="video-tag" style="display: none;"></video>
  </div>
</template>
<script>
export default {
  data() {
    return {
      webcamfile: null,  // Stores webcam file data after recording
      recordWebCam: null,  // MediaRecorder object to handle webcam recording
      configWebCam: {
        audio: false,  // No audio capture for the webcam
        video: { 
          width: document.getElementById("video-tag").videoWidth,  // Webcam video width
          height: document.getElementById("video-tag").videoHeight,  // Webcam video height
        },
      },

      // Calibration points and related state variables
      circleIrisPoints: [],
      calibPredictionPoints: [],
      calibFinished: false,
      currentStep: 1,
      animationRefreshRate: 10,
      animationFrames: 250,
      innerCircleRadius: 5,
      usedPattern: [],
    };
  },
  computed: {
    // Computed properties for calibration settings and model details
    radius() { return this.$store.state.calibration.radius; },
    offset() { return this.$store.state.calibration.offset; },
    predByPointCount() { return this.$store.state.calibration.samplePerPoint; },
    pattern() { return this.$store.state.calibration.pattern; },
    mockPattern() { return this.$store.state.calibration.mockPattern; },
    backgroundColor() { return this.$store.state.calibration.backgroundColor; },
    pointColor() { return this.$store.state.calibration.pointColor; },
    leftEyeTreshold() { return this.$store.state.calibration.leftEyeTreshold; },
    rightEyeTreshold() { return this.$store.state.calibration.rightEyeTreshold; },
    index() { return this.$store.state.calibration.index; },
    msPerCapture() { return this.$store.state.calibration.msPerCapture; },
    model: {
      get() { return this.$store.state.detect.model; },
      set() { }
    },
    isControlled() { return this.$store.state.calibration.isControlled; },
  },
  created() {
    this.$store.commit('setIndex', 0);  // Initialize the calibration index
    this.usedPattern = (this.mockPattern.length > 0) ? this.mockPattern : this.pattern;
  },
  async mounted() {
    await this.startWebCamCapture();  // Start webcam capture when component is mounted
    this.drawPoint(this.usedPattern[0].x, this.usedPattern[0].y, 1);  // Draw the first calibration point
    this.advance(this.usedPattern, this.circleIrisPoints, this.msPerCapture);  // Start calibration process
  },
  methods: {
    // Advances through the calibration process step by step
    advance(pattern, whereToSave, timeBetweenCaptures) {
      const th = this;
      var i = 0;
      async function keydownHandler(event) {
        if ((event.key === "s" || event.key === "S")) {
          if (i <= pattern.length - 1) {
            document.removeEventListener('keydown', keydownHandler);
            await th.extract(pattern[i], timeBetweenCaptures);
            th.$store.commit('setIndex', i);
            i++;
            if (i != pattern.length) {
              await th.triggerAnimation(pattern[i - 1], pattern[i], this.animationRefreshRate);
            }
            document.addEventListener('keydown', keydownHandler);
          } else {
            th.$store.commit('setIndex', i);
            document.removeEventListener('keydown', keydownHandler);
            th.savePoint(whereToSave, th.usedPattern);
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      }
      document.addEventListener('keydown', keydownHandler);
    },

    // Moves to the next calibration step
    nextStep() {
      this.usedPattern.forEach(element => {
        delete element.data;  // Clear previous data for new step
      });
      this.$store.commit('setIndex', 0);
      this.currentStep = 2;  // Switch to next step
      this.drawPoint(this.usedPattern[0].x, this.usedPattern[0].y, 1);
      this.advance(this.usedPattern, this.calibPredictionPoints, this.msPerCapture);
    },

    // Extracts data points for calibration
    async extract(point, timeBetweenCaptures) {
      point.data = [];
      for (var a = 0; a < this.predByPointCount;) {
        const prediction = await this.detectFace();
        const pred = prediction[0];
        // Check for eye blinks and skip the data if eyes are closed
        const isLeftBlink = this.calculateDistance(pred.annotations.leftEyeUpper0[3], pred.annotations.leftEyeLower0[11]) < this.leftEyeTreshold;
        const isRightBlink = this.calculateDistance(pred.annotations.rightEyeUpper0[3], pred.annotations.rightEyeLower0[11]) < this.rightEyeTreshold;

        if (isLeftBlink || isRightBlink) {
          console.log('Eyes closed, discarding data');
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          const newPrediction = { 
            leftIris: pred.annotations.leftEyeIris[0], 
            rightIris: pred.annotations.rightEyeIris[0] 
          };
          point.data.push(newPrediction);
          this.drawPoint(point.x, point.y, (this.radius / this.predByPointCount) * a);
          a++;
        }
        await new Promise(resolve => setTimeout(resolve, timeBetweenCaptures));
      }
    },

    // Animate the transition between calibration points
    async triggerAnimation(origin, target, animationRefreshRate) {
      const frames = this.animationFrames;
      const deltaX = (target.x - origin.x) / frames;
      const deltaY = (target.y - origin.y) / frames;

      for (let d = 1; d <= frames; d++) {
        const xPosition = origin.x + deltaX * d;
        const yPosition = origin.y + deltaY * d;
        const radius = (this.radius / frames) * (frames - d);
        this.drawPoint(xPosition, yPosition, radius);
        await new Promise(resolve => setTimeout(resolve, animationRefreshRate));
      }
    },

    // Calculates the distance between two points (used for detecting eye blinks)
    calculateDistance(eyelidTip, eyelidBottom) {
      const xDistance = eyelidBottom[0] - eyelidTip[0];
      const yDistance = eyelidBottom[1] - eyelidTip[1];
      return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
    },

    // Draws the calibration points on the canvas
    drawPoint(x, y, radius) {
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = this.pointColor;
      ctx.fillStyle = this.pointColor;
      ctx.arc(x, y, radius, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.fill();
    },

    // Ends the calibration and processes the results
    async endCalib() {
      // Cleanup and store final data
      this.calibPredictionPoints.forEach(element => {
        delete element.point_x;
        delete element.point_y;
      });
      const screenHeight = window.screen.height;
      const screenWidth = window.screen.width;
      let predictions = await this.$store.dispatch('sendData', {
        circleIrisPoints: this.circleIrisPoints,
        calibPredictionPoints: this.calibPredictionPoints,
        screenHeight,
        screenWidth,
        k: this.$store.state.calibration.pointNumber,
        threshold: this.$store.state.calibration.threshold,
      });

      // Handle predictions
      if (typeof predictions === 'string') {
        predictions = predictions.replace(/NaN/g, '1');
        try {
          predictions = JSON.parse(predictions);
        } catch (error) {
          console.error('Error parsing predictions string:', error);
        }
      }
      this.usedPattern.forEach((element) => {
        const prediction = predictions[element.x.toString().split('.')[0]][element.y.toString().split('.')[0]];
        element.precision = prediction.PrecisionSD.toFixed(2);
        element.accuracy = prediction.Accuracy.toFixed(2);
        element.predictionX = prediction.predicted_x;
        element.predictionY = prediction.predicted_y;
      });
      this.$store.dispatch('extractXYValues', { extract: this.circleIrisPoints, hasCalib: true });
      this.$store.dispatch('extractXYValues', { extract: this.calibPredictionPoints, hasCalib: false });
      this.stopRecord();
      this.$store.commit('setMockPattern', []);
      this.$router.push('/postCalibration');
    },

    // Saves the calibration points to a given destination
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
          };
          whereToSave.push(data);
        });
      });
    },

    // Starts the webcam capture process
    async startWebCamCapture() {
      const constraints = { video: { facingMode: "user", width: 640, height: 480 } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = document.getElementById('video-tag');
      video.srcObject = stream;
      this.recordWebCam = new MediaRecorder(stream);
      this.recordWebCam.start();
    },

    // Stops the webcam recording
    stopRecord() {
      this.recordWebCam.stop();
      this.recordWebCam.ondataavailable = (e) => {
        const videoBlob = e.data;
        this.webcamfile = URL.createObjectURL(videoBlob);
      };
    },

    // Handles face detection for calibration
    detectFace() {
      return this.$store.dispatch('getModelPrediction');  // Assumes a model is used for face prediction
    },
  }
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
