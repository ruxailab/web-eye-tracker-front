<template>
  <div>
    <v-row v-if="callibFinished" justify="center" class="mt-12 pt-12">
      <v-col cols="12" lg="4" md="4" sm="6">
        <v-btn block outlined color="green" @click="saveCallib()">
          Save callibration
          <v-icon right>mdi-content-save</v-icon>
        </v-btn>
        <v-btn block class="mt-4" outlined color="red" to="/">
          Discard
          <v-icon right>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <canvas id="canvas" v-else />
    <video autoplay id="video-tag" style="display: none"></video>
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
      interval: 100,
      radius: 20,
      offset: 100,
      ctx: null,
      callibPoints: [],
      index: 0,
      webcamfile: null,
      recordWebCam: null,
      configWebCam: {
        audio: false,
        video: { width: 600, height: 500 },
      },
      mouseIrisPoints: [],
      callibFinished: false,
      predictions: [],
      isStop: false,
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
      // this.startMouseEventCapture();
      this.move();
    },
    // startMouseEventCapture() {
    //   const th = this;
    //   onmousemove = function(event) {
    //     if (!this.isStop) {
    //       if (th.predictions[0]) {
    //         th.mouseIrisPoints.push({
    //           mouse_x: event.clientX,
    //           mouse_y: event.clientY,
    //           left_iris_x: th.predictions[0].scaledMesh[468]["0"],
    //           left_iris_y: th.predictions[0].scaledMesh[468]["1"],
    //           right_iris_x: th.predictions[0].scaledMesh[473]["0"],
    //           right_iris_y: th.predictions[0].scaledMesh[473]["1"],
    //         });
    //       }
    //     }
    //   };
    // },
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
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
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
    },
    async saveCallib() {
      console.log(this.mouseIrisPoints);
      // Save calib data to store
      this.$store.commit("setCurrentCalib", this.mouseIrisPoints);
      this.$router.push("/sessions/new");
    },
    move() {
      let id;

      if (this.index == this.callibPoints.length) {
        this.stopRecord();
        cancelAnimationFrame(id);
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

      // set relation between eyes and circle x y
      if (!this.isStop) {
        if (this.predictions[0]) {
          this.mouseIrisPoints.push({
            mouse_x: this.callibPoints[this.index].x,
            mouse_y: this.callibPoints[this.index].y,
            left_iris_x: this.predictions[0].scaledMesh[468]["0"],
            left_iris_y: this.predictions[0].scaledMesh[468]["1"],
            right_iris_x: this.predictions[0].scaledMesh[473]["0"],
            right_iris_y: this.predictions[0].scaledMesh[473]["1"],
          });
        }
      }

      this.index++;
      setTimeout(() => {
        id = requestAnimationFrame(this.move);
      }, this.interval);
    },
    rndNum(min, max) {
      return Math.random() * (max - min) + min;
    },
    generateCallibPoints() {
      this.canvas = document.getElementById("canvas");
      this.w = this.canvas.width = window.innerWidth;
      this.h = this.canvas.height = window.innerHeight;
      this.ctx = this.canvas.getContext("2d");

      // 34 POINTS -> Implements 9-Point Calibration Method
      // this.callibPoints = [
      //   // ROUND 1
      //   // top to down
      //   { x: this.offset, y: this.offset },
      //   { x: this.w / 2, y: this.offset },
      //   { x: this.w - this.offset, y: this.offset },

      //   { x: this.w - this.offset, y: this.h / 2 },
      //   { x: this.w / 2, y: this.h / 2 },
      //   { x: this.offset, y: this.h / 2 },

      //   { x: this.offset, y: this.h - this.offset },
      //   { x: this.w / 2, y: this.h - this.offset },
      //   { x: this.w - this.offset, y: this.h - this.offset },

      //   // down to top
      //   { x: this.w / 2, y: this.h - this.offset },
      //   { x: this.offset, y: this.h - this.offset },

      //   { x: this.offset, y: this.h / 2 },
      //   { x: this.w / 2, y: this.h / 2 },
      //   { x: this.w - this.offset, y: this.h / 2 },

      //   { x: this.w - this.offset, y: this.offset },
      //   { x: this.w / 2, y: this.offset },
      //   { x: this.offset, y: this.offset },

      //   // ROUND 2
      //   // top to down
      //   { x: this.w / 2, y: this.offset },
      //   { x: this.w - this.offset, y: this.offset },

      //   { x: this.w - this.offset, y: this.h / 2 },
      //   { x: this.w / 2, y: this.h / 2 },
      //   { x: this.offset, y: this.h / 2 },

      //   { x: this.offset, y: this.h - this.offset },
      //   { x: this.w / 2, y: this.h - this.offset },
      //   { x: this.w - this.offset, y: this.h - this.offset },

      //   // down to top
      //   { x: this.w / 2, y: this.h - this.offset },
      //   { x: this.offset, y: this.h - this.offset },

      //   { x: this.offset, y: this.h / 2 },
      //   { x: this.w / 2, y: this.h / 2 },
      //   { x: this.w - this.offset, y: this.h / 2 },

      //   { x: this.w - this.offset, y: this.offset },
      //   { x: this.w / 2, y: this.offset },
      //   { x: this.offset, y: this.offset },
      // ];

      // MOVING OBJECT WITH OFFSET TILL SCREEN HEIGHT
      // let currentPoint = {
      //   h: this.radius,
      //   w: this.radius,
      // };
      // let order = "left-to-right";

      // while (currentPoint.h < this.h) {
      //   this.callibPoints.push({
      //     x: currentPoint.w,
      //     y: currentPoint.h,
      //   });

      //   if (order === "left-to-right") {
      //     currentPoint.w += this.offset;
      //     if (currentPoint.w > this.w) {
      //       currentPoint.h += this.offset;
      //       currentPoint.w = this.w - this.radius;
      //       order = "right-to-left";
      //     }
      //   } else {
      //     currentPoint.w -= this.offset;
      //     if (currentPoint.w < 0) {
      //       currentPoint.h += this.offset;
      //       currentPoint.w = this.radius;
      //       order = "left-to-right";
      //     }
      //   }
      // }


      // Calibration via ellipse
      function drawEllipse(context, x, y, semiMajorAxis, semiMinorAxis) {
        context.beginPath();
        var callibPoints = [];
        const step = Math.PI / 16; // Change this value for a smoother or more jagged ellipse
        for (let theta = 0; theta < 2 * Math.PI; theta += step) {
          const xPos = x + semiMajorAxis * Math.cos(theta);
          const yPos = y + semiMinorAxis * Math.sin(theta);
          if (theta === 0) {
            context.moveTo(xPos, yPos);
          } else {
            context.lineTo(xPos, yPos);
          }

          callibPoints.push({
            x: xPos,
            y: yPos,
          });
        }
        
        return callibPoints;
      }
      var y = this.canvas.height / 2;
      var x = this.canvas.width / 2;
      var majorAxis = 300
      var minorAxis = 50
      for (var n = 0; n < 5; n++) {
        this.callibPoints.push(...drawEllipse(this.ctx, x, y, majorAxis, minorAxis));
        // y -= this.offset;
        majorAxis += this.offset
        minorAxis += this.offset
      }

      console.log("calib points =>", this.callibPoints);
    },
  },
};
</script>
