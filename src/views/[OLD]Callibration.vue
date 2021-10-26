<template>
  <div id="box">
    <Toolbar />
    <v-container class="mt-12">
      <v-row justify="center" align="start">
        <v-col cols="12" lg="5" md="5">
          <v-card outlined>
            <v-card-title>
              <v-icon left>mdi-information</v-icon>
              Callibration System
            </v-card-title>
            <p class="mx-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed
              felis at dolor hendrerit cursus. <br /><br />Lorem ipsum dolor sit
              amet, consectetur adipiscing elit. Nunc sed felis at dolor
              hendrerit cursus. <br /><br />Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Nunc sed felis at dolor hendrerit
              cursus.
            </p>
            <v-card-actions class="px-4 mt-12 mb-4">
              <v-btn block outlined color="green" :disabled="!isCameraOn" @click="goToCallibRecord()"
                >start Callibration</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" lg="7" md="7">
          <v-row justify="center" class="ma-0">
            <v-btn
              @click="setupCamera()"
              v-if="!isCameraOn"
              outlined
              color="blue"
            >
              Turn camera on
              <v-icon right size="20">mdi-camera-outline</v-icon>
            </v-btn>
          </v-row>
          <div v-if="!isModelLoaded && isCameraOn">
            <v-row justify="center" class="mt-8">
              <v-progress-circular
                :size="50"
                :width="7"
                color="black"
                indeterminate
              ></v-progress-circular>
            </v-row>
          </div>
          <video autoplay id="video-tag" style="display: none"></video>
          <canvas id="canvas" width="600px" height="500px" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Toolbar from "@/components/Toolbar.vue";
const tf = require("@tensorflow/tfjs");
const blazeface = require("@tensorflow-models/blazeface");

export default {
  components: {
    Toolbar,
  },
  data() {
    return {
      isCameraOn: false,
      model: null,
      predictions: [],
      isModelLoaded: false,
      webcamStream: null
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
  methods: {
    goToCallibRecord() {
      // element which needs to enter full-screen mode
      var element = document.querySelector("#box");

      // make the element go to full-screen mode
      element
        .requestFullscreen()
        .then(function() {
          // element has entered fullscreen mode 
        })
        .catch(function(error) {
          console.log(error);
          // element could not enter fullscreen mode
        });

        this.webcamStream.getTracks().forEach((track) => {
          track.stop()
        })
        this.$router.push('/callibration/record')
    },
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

          this.webcamStream = stream

          await tf.getBackend();
          this.model = await blazeface.load();
          this.isModelLoaded = true;
          this.detectFace();
        });
    },
    async detectFace() {
      let video = document.getElementById("video-tag");
      let canvas = document.getElementById("canvas");
      let ctx = canvas.getContext("2d");
      const prediction = await this.model.estimateFaces(video, false);
      this.predictions = prediction;
      // draw the video first
      ctx.drawImage(video, 0, 0, 600, 500);

      prediction.forEach((pred) => {
        // draw the rectangle enclosing the face
        ctx.beginPath();
        ctx.lineWidth = "4";
        ctx.strokeStyle = "blue";
        // the last two arguments are width and height
        // since blazeface returned only the coordinates,
        // we can find the width and height by subtracting them.
        ctx.rect(
          pred.topLeft[0],
          pred.topLeft[1],
          pred.bottomRight[0] - pred.topLeft[0],
          pred.bottomRight[1] - pred.topLeft[1]
        );
        ctx.stroke();

        // drawing small rectangles for the face landmarks
        // ctx.fillStyle = "red";
        // pred.landmarks.forEach((landmark) => {
        //   ctx.fillRect(landmark[0], landmark[1], 5, 5);
        // });
      });
    },
  },
};
</script>
