<template>
  <div style="height: 100%;">
    <div v-if="!model" class="center-container">
      <v-progress-circular :size="80" :width="8" indeterminate color="black" class="loading-spinner"
        style="margin-bottom: 16px;"></v-progress-circular>
      <div>Loading model...</div>
    </div>

    <div v-if="loadingConfig" class="center-container">
      <v-progress-circular :size="80" :width="8" indeterminate color="black" class="loading-spinner"
        style="margin-bottom: 16px;"></v-progress-circular>
      <div>Loading Ruxailab calibration config...</div>
    </div>

    <!-- <div v-if="redirectingToRuxailab" class="center-container">
      <v-progress-circular :size="80" :width="8" indeterminate color="black" class="loading-spinner"
        style="margin-bottom: 16px;"></v-progress-circular>
      <div>Sending calibration data to Ruxailab...</div>
      <div style="margin-top: 16px; font-size: 14px; color: #666;">
        This window will close automatically or you can close it manually.
      </div>
    </div> -->
    <!-- loading case ^ -->

    <!-- Calibration Stepper -->
    <v-dialog v-model="showStepper" persistent max-width="800" :fullscreen="$vuetify.breakpoint.xs">
      <v-card>
        <v-stepper v-model="stepperStep" elevation="0" class="calibration-stepper">
          <v-stepper-header>
            <v-stepper-step :complete="stepperStep > 1" step="1" color="#FF425A">
              Overview
            </v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="stepperStep > 2" step="2" color="#FF425A">
              Training
            </v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="stepperStep > 3" step="3" color="#FF425A">
              Validation
            </v-stepper-step>
            <v-divider></v-divider>
            <v-stepper-step :complete="stepperStep > 4" step="4" color="#FF425A">
              Complete
            </v-stepper-step>
          </v-stepper-header>

          <v-stepper-items>
            <!-- Step 1: Overview -->
            <v-stepper-content step="1">
              <v-card flat>
                <v-card-text class="text-center px-6 py-6">
                  <v-icon size="50" color="#FF425A" class="mb-4">mdi-eye-settings</v-icon>
                  <h2 class="text-h4 font-weight-bold mb-4">Eye Tracking Calibration</h2>

                  <v-alert color="#002D51" dark class="mb-4 text-left">
                    <div class="text-body-1">
                      <p class="font-weight-bold mb-2">This calibration consists of two phases:</p>
                      <ol class="pl-4">
                        <li class="mb-1"><strong>Training Phase:</strong> The system learns your eye movement patterns
                        </li>
                        <li><strong>Validation Phase:</strong> The system verifies the calibration accuracy</li>
                      </ol>
                    </div>
                  </v-alert>

                  <v-row class="mb-4">
                    <v-col cols="6">
                      <v-alert color="#FF425A" dark dense>
                        <div class="d-flex align-center">
                          <v-icon left>mdi-check-circle</v-icon>
                          <span><strong>Success:</strong> You can use the tool</span>
                        </div>
                      </v-alert>
                    </v-col>
                    <v-col cols="6">
                      <v-alert color="#002D51" dark dense>
                        <div class="d-flex align-center">
                          <v-icon left>mdi-alert-circle</v-icon>
                          <span><strong>Failure:</strong> Repeat calibration</span>
                        </div>
                      </v-alert>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions class="justify-center pb-6">
                  <v-btn x-large color="#FF425A" dark @click="stepperStep = 2" class="px-8">
                    <v-icon left>mdi-arrow-right</v-icon>
                    Continue
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <!-- Step 2: Training Instructions -->
            <v-stepper-content step="2">
              <v-card flat>
                <v-card-text class="text-center px-6 py-6">
                  <v-icon size="50" color="#FF425A" class="mb-4">mdi-school</v-icon>
                  <h2 class="text-h4 font-weight-bold mb-4">Training Phase</h2>

                  <v-card outlined class="pa-4 mb-4 text-left">
                    <h3 class="text-h6 font-weight-bold mb-3 text-center">Instructions</h3>
                    <div class="text-body-1">
                      <p class="mb-2"><v-icon small color="#FF425A">mdi-eye</v-icon> <strong>Look at the red
                          dot</strong> that appears on screen</p>
                      <p class="mb-2"><v-icon small color="#FF425A">mdi-keyboard</v-icon> <strong>Press S</strong> when
                        ready to record each point</p>
                      <p class="mb-2"><v-icon small color="#FF425A">mdi-head</v-icon> <strong>Keep your head
                          still</strong> during the entire process</p>
                      <p class="mb-0"><v-icon small color="#FF425A">mdi-target</v-icon> <strong>Follow the
                          points</strong> with your eyes only</p>
                    </div>
                  </v-card>

                  <v-alert color="#FF425A" dark dense class="text-center">
                    <strong>Total points to calibrate:</strong> {{ usedPattern.length }}
                  </v-alert>
                </v-card-text>
                <v-card-actions class="justify-space-between px-6 pb-6">
                  <v-btn text @click="stepperStep = 1">
                    <v-icon left>mdi-arrow-left</v-icon>
                    Back
                  </v-btn>
                  <v-btn x-large color="#FF425A" dark @click="startTraining" class="px-8">
                    <v-icon left size="28">mdi-play-circle</v-icon>
                    <span class="text-h6">Start Training</span>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <!-- Step 3: Validation Instructions -->
            <v-stepper-content step="3">
              <v-card flat>
                <v-card-text class="text-center px-6 py-6">
                  <v-icon size="50" color="#FF425A" class="mb-4">mdi-check-decagram</v-icon>
                  <h2 class="text-h4 font-weight-bold mb-4">Validation Phase</h2>

                  <v-alert color="#FF425A" dark class="mb-4">
                    <div class="text-center">
                      <p class="font-weight-bold mb-1">Training Complete!</p>
                      <p class="mb-0">Successfully collected {{ circleIrisPoints.length }} training samples</p>
                    </div>
                  </v-alert>

                  <v-card outlined class="pa-4 mb-4 text-left">
                    <h3 class="text-h6 font-weight-bold mb-3 text-center">Validation Instructions</h3>
                    <div class="text-body-1">
                      <p class="mb-2"><v-icon small color="#FF425A">mdi-eye</v-icon> <strong>Look at the red
                          dot</strong> that appears on screen</p>
                      <p class="mb-2"><v-icon small color="#FF425A">mdi-keyboard</v-icon> <strong>Press S</strong> when
                        ready to record each point</p>
                      <p class="mb-2"><v-icon small color="#FF425A">mdi-head</v-icon> <strong>Keep your head
                          still</strong> during the entire process</p>
                      <p class="mb-0"><v-icon small color="#FF425A">mdi-target</v-icon> <strong>Follow the
                          points</strong> with your eyes only</p>
                    </div>
                  </v-card>

                  <v-alert color="#002D51" dark dense class="text-center">
                    <strong>This phase verifies the calibration accuracy</strong>
                  </v-alert>
                </v-card-text>
                <v-card-actions class="justify-center pb-6">
                  <v-btn x-large color="#FF425A" dark @click="startValidation" class="px-8">
                    <v-icon left size="28">mdi-play-circle</v-icon>
                    <span class="text-h6">Start Validation</span>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>

            <!-- Step 4: Completion -->
            <v-stepper-content step="4">
              <v-card flat>
                <v-card-text class="text-center px-6 py-8">
                  <v-icon size="50" color="#FF425A" class="mb-4">mdi-check-circle</v-icon>
                  <h2 class="text-h3 font-weight-bold mb-4">Calibration Complete!</h2>

                  <v-alert color="#FF425A" dark class="mb-3">
                    <div class="text-center">
                      <p class="font-weight-bold mb-1">Training: {{ circleIrisPoints.length }} samples collected</p>
                      <p class="mb-0">Validation: {{ calibPredictionPoints.length }} samples collected</p>
                    </div>
                  </v-alert>

                  <v-alert color="#002D51" dark class="mb-4">
                    <div class="text-center">
                      <v-icon left>mdi-check-circle</v-icon>
                      <span class="font-weight-bold">Your eye tracking calibration was successful!</span>
                    </div>
                  </v-alert>

                  <p class="text-h6 grey--text mb-4">Processing your calibration data...</p>
                </v-card-text>
                <v-card-actions class="justify-center pb-8">
                  <v-btn x-large color="#FF425A" dark @click="endCalib()" class="px-12">
                    <v-icon left size="32">mdi-check-bold</v-icon>
                    <span class="text-h5">Finish</span>
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </v-card>
    </v-dialog>
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
      isCollecting: false,
      faceDetected: true,
      redirectingToRuxailab: false,
      stepperStep: 1,
      showStepper: true,
      calibrationStarted: false,
      loadingConfig: false
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
    console.log("rodou created");
    await this.verifyFromRuxailab()
    this.$store.commit('setIndex', 0)
    this.usedPattern = this.generateRuntimePattern()

    if (this.usedPattern.length === 0) {
      const width = window.innerWidth
      const height = window.innerHeight
      const offset = this.offset || 100
      const pointCount = this.$store.state.calibration.pointNumber

      const generatedPattern = this.generateCalibrationPattern(pointCount, width, height, offset)

      this.$store.commit('setMockPattern', generatedPattern)
      this.usedPattern = generatedPattern

    }
    await this.startWebCamCapture();
    console.log("chamou drawPoint no created com os valores:", this.usedPattern[0].x, this.usedPattern[0].y);
    this.drawPoint(this.usedPattern[0].x, this.usedPattern[0].y, 1)
    this.advance(this.usedPattern, this.circleIrisPoints, this.msPerCapture)
    console.log("UsedPattern inteiro", this.usedPattern);

  },
  methods: {
    generateCalibrationPattern(pointCount, width, height, offset) {
      const patterns = [];
      
      switch(pointCount) {
        case 1:
          // Center point only
          patterns.push({ x: width/2, y: height/2 });
          break;
          
        case 2:
          // Left and right edges (horizontal coverage)
          patterns.push({ x: offset, y: height/2 });
          patterns.push({ x: width - offset, y: height/2 });
          break;
          
        case 3:
          // Horizontal line: left, center, right
          patterns.push({ x: offset, y: height/2 });
          patterns.push({ x: width/2, y: height/2 });
          patterns.push({ x: width - offset, y: height/2 });
          break;
          
        case 4:
          // Four corners (optimal for 4-point calibration)
          patterns.push({ x: offset, y: offset });
          patterns.push({ x: width - offset, y: offset });
          patterns.push({ x: offset, y: height - offset });
          patterns.push({ x: width - offset, y: height - offset });
          break;
          
        case 5:
          // Four corners + center (cross pattern)
          patterns.push({ x: offset, y: offset });
          patterns.push({ x: width - offset, y: offset });
          patterns.push({ x: width/2, y: height/2 });
          patterns.push({ x: offset, y: height - offset });
          patterns.push({ x: width - offset, y: height - offset });
          break;
          
        case 6: {
          // 3x2 rectangle pattern
          const stepX6 = (width - 2 * offset) / 2;
          const stepY6 = (height - 2 * offset) / 1;
          for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 3; j++) {
              patterns.push({
                x: offset + j * stepX6,
                y: offset + i * stepY6,
              });
            }
          }
          break;
        }
          
        case 7:
          // Partial 3x3 grid (strategic selection)
          patterns.push({ x: offset, y: offset });
          patterns.push({ x: width/2, y: offset });
          patterns.push({ x: width - offset, y: offset });
          patterns.push({ x: offset, y: height/2 });
          patterns.push({ x: width - offset, y: height/2 });
          patterns.push({ x: offset, y: height - offset });
          patterns.push({ x: width - offset, y: height - offset });
          break;
          
        case 8:
          // Partial 3x3 grid (without center)
          patterns.push({ x: offset, y: offset });
          patterns.push({ x: width/2, y: offset });
          patterns.push({ x: width - offset, y: offset });
          patterns.push({ x: offset, y: height/2 });
          patterns.push({ x: width - offset, y: height/2 });
          patterns.push({ x: offset, y: height - offset });
          patterns.push({ x: width/2, y: height - offset });
          patterns.push({ x: width - offset, y: height - offset });
          break;
          
        case 9:
        default: {
          // Full 3x3 grid (current working pattern)
          const cols = 3;
          const rows = 3;
          const usableWidth = width - 2 * offset;
          const usableHeight = height - 2 * offset;
          const stepX = usableWidth / (cols - 1);
          const stepY = usableHeight / (rows - 1);
          
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
              patterns.push({
                x: offset + j * stepX,
                y: offset + i * stepY,
              });
            }
          }
          break;
        }
      }
      
      return patterns;
    },
    
    startTraining() {
      this.showStepper = false;
      this.calibrationStarted = true;
    },
    startValidation() {
      this.showStepper = false;
      this.calibrationStarted = true;
    },
    advance(pattern, whereToSave, timeBetweenCaptures) {
      const th = this
      var i = 0
      async function keydownHandler(event) {
        // Block key press if stepper is shown
        if (th.showStepper) {
          return;
        }

        if ((event.key === "s" || event.key === "S" || event.key === "Enter")) {
          if (i < pattern.length) {
            document.removeEventListener('keydown', keydownHandler)
            th.isCollecting = true
            await th.extract(pattern[i], timeBetweenCaptures)
            th.isCollecting = false

            th.$store.commit('setIndex', i)
            i++

            if (i < pattern.length) {
              await th.triggerAnimation(pattern[i - 1], pattern[i], this.animationRefreshRate)
              document.addEventListener('keydown', keydownHandler)
            } else {
              // Completed all points - finalize
              th.$store.commit('setIndex', i)
              th.savePoint(whereToSave, th.usedPattern)
              const canvas = document.getElementById('canvas');
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              // Show stepper at step 3 (validation) or step 4 (completion)
              if (th.currentStep === 1) {
                th.nextStep();
              } else {
                th.stepperStep = 4;
                th.showStepper = true;
              }
            }
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
      this.stepperStep = 3;
      this.showStepper = true;
      this.calibrationStarted = false;

      console.log("nextStep rodou drawPoint com os valores:", this.usedPattern[0].x, this.usedPattern[0].y);

      this.drawPoint(this.usedPattern[0].x, this.usedPattern[0].y, 1)
      this.advance(this.usedPattern, this.calibPredictionPoints, this.msPerCapture)
    },
    async extract(point, timeBetweenCaptures) {
      point.data = [];
      for (var a = 0; a < this.predByPointCount;) {
        const prediction = await this.detectFace();

        // 🛡️ DEFENSIVE GUARD: Check if face is detected
        // When user moves face out of frame, prediction array is empty
        // This prevents crash: "Cannot read property 'annotations' of undefined"
        if (!prediction || prediction.length === 0) {
          this.faceDetected = false;
          console.warn('Face not detected. Waiting for face to return...');
          await new Promise(resolve => setTimeout(resolve, 500));
          continue; // Skip this iteration and retry
        }

        this.faceDetected = true;
        const pred = prediction[0];

        // Additional safety check for required annotations
        if (!pred.annotations || !pred.annotations.leftEyeIris || !pred.annotations.rightEyeIris) {
          console.warn('Incomplete face landmarks detected. Retrying...');
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }

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

      console.log('Window size:', window.innerWidth, 'x', window.innerHeight);

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
      const screenHeight = window.innerHeight
      const screenWidth = window.innerWidth

      let predictions = await this.$store.dispatch('sendData', {
        fromRuxailab: false,
        circleIrisPoints: this.circleIrisPoints,
        calibPredictionPoints: this.calibPredictionPoints,
        screenHeight,
        screenWidth,
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
      
      // Update the store's pattern with the prediction data
      this.$store.commit('setPattern', this.usedPattern)
      
      this.$store.dispatch('extractXYValues', { extract: this.circleIrisPoints, hasCalib: true })
      this.$store.dispatch('extractXYValues', { extract: this.calibPredictionPoints, hasCalib: false })

      this.$store.commit('setRuntimeData', {
        usedPattern: this.usedPattern,
        circleIrisPoints: this.circleIrisPoints,
        calibPredictionPoints: this.calibPredictionPoints,
        fromRuxailab: this.fromRuxailab,
      })

      this.stopRecord()

      this.$router.push(
        `/postCalibration?redirectingToRuxailab=${this.fromRuxailab}`
      )
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
      this.loadingConfig = true;
      const { data } = await axios.get(
        `${process.env.VUE_APP_RUXAILAB_URL}/getCalibrationConfig`,
        { params: { testId } }
      );


      const calibrationConfig = data.calibrationConfig;

      this.$store.commit('setCalibrationConfig', calibrationConfig);
      this.loadingConfig = false;
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

    generateRuntimePattern() {
      const width = window.innerWidth
      const height = window.innerHeight
      const offset = this.offset || 100
      const points = this.$store.state.calibration.pointNumber || 9

      const minCols = 3
      const cols = Math.max(minCols, Math.round(Math.sqrt(points)))
      const rows = Math.ceil(points / cols)


      const usableWidth = width - 2 * offset
      const usableHeight = height - 2 * offset

      const stepX = usableWidth / (cols - 1)
      const stepY = usableHeight / (rows - 1)

      const pattern = []

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (pattern.length < points) {
            pattern.push({
              x: offset + j * stepX,
              y: offset + i * stepY
            })
          }
        }
      }

      return pattern
    }
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

/* Face not detected warning */
.face-warning {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 152, 0, 0.95);
  color: white;
  padding: 12px 24px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(255, 152, 0, 0.5);
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }

  25% {
    transform: translateX(-50%) translateY(-2px);
  }

  75% {
    transform: translateX(-50%) translateY(2px);
  }
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

  0%,
  100% {
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

/* Calibration Stepper */
.calibration-stepper .v-stepper__header {
  box-shadow: none !important;
  background-color: #002D51 !important;
  border-radius: 0px !important;
  padding: 0px !important;
}

.calibration-stepper {
  box-shadow: none !important;
  border-radius: 0px !important;
  overflow: hidden !important;
}

.calibration-stepper .v-stepper__step__step {
  background-color: rgba(255, 255, 255, 0.3) !important;
  color: white !important;
}

.calibration-stepper .v-stepper__step--active .v-stepper__step__step {
  background-color: #FF425A !important;
  color: white !important;
}

.calibration-stepper .v-stepper__step--complete .v-stepper__step__step {
  background-color: #FF425A !important;
  color: white !important;
}

.calibration-stepper .v-stepper__step .v-stepper__label {
  color: white !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  text-shadow: none !important;
}

.calibration-stepper .v-stepper__step--active .v-stepper__label {
  color: white !important;
}

.calibration-stepper .v-stepper__step--complete .v-stepper__label {
  color: white !important;
}

.calibration-stepper .v-divider {
  border-color: rgba(255, 255, 255, 0.3) !important;
}
</style>

<style>
/* Fix dialog centering - without scoped */
.v-dialog__content {
  width: 100% !important;
  align-items: center !important;
  justify-content: center !important;
}
</style>
