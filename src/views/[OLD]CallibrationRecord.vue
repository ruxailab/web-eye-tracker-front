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
  </div>
</template>

<script>
import api from '@/services/callib'

export default {
  data() {
    return {
      canvas: null,
      w: 0,
      h: 0,
      interval: 2000,
      radius: 20,
      offset: 30,
      ctx: null,
      callibPoints: [],
      index: 0,
      webcamfile: null,
      recordWebCam: null,
      configWebCam: {
        video: true,
        audio: false,
      },
      mouseEvents: [],
      callibFinished: false,
    };
  },
  mounted() {
    this.startCallib();
  },
  methods: {
    startCallib() {
      this.generateCallibPoints();
      this.startWebCamCapture();
      this.startMouseEventCapture();
      this.move();
    },
    startMouseEventCapture() {
      const th = this;
      onmousemove = function(event) {
        th.mouseEvents.push({
          x: event.clientX,
          y: event.clientY,
        });
      };
    },
    async startWebCamCapture() {
      // Request permission for screen capture
      return navigator.mediaDevices
        .getUserMedia(this.configWebCam)
        .then((mediaStreamObj) => {
          // Create media recorder object
          this.recordWebCam = new MediaRecorder(mediaStreamObj, {
            mimeType: "video/webm; codecs=vp9",
          });
          let recordingWebCam = [];

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
        })
        .catch((e) => {
          console.error("Error", e);
          this.stopRecord();
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
      // Format blobs into File
      this.webcamfile = new File(
        [this.webcamfile.blob],
        `${this.webcamfile.name}.webm`,
        { lastModifiedDate: new Date(), type: this.webcamfile.blob.type }
      );

      // Upload data to api
      api.saveCalibration({
          webcamfile: this.webcamfile,
          user_id: this.$store.state.auth.user.uid,
          mouse_events: this.mouseEvents
      }).then(() => {
          this.$router.push('/')
      })

    },
    move() {
      let id;

      if (this.index == this.callibPoints.length) {
        this.stopRecord();
        cancelAnimationFrame(id);
        return;
      }

      this.ctx.clearRect(0, 0, this.w, this.h);
      this.ctx.beginPath();
      this.ctx.strokeStyle = "red";
      this.ctx.fillStyle = "red";
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

      this.callibPoints = [
        // top to down
        { x: this.offset, y: this.offset },
        { x: this.w / 2, y: this.offset },
        { x: this.w - this.offset, y: this.offset },
        { x: this.offset, y: this.h / 2 },
        { x: this.w / 2, y: this.h / 2 },
        { x: this.w - this.offset, y: this.h / 2 },
        { x: this.offset, y: this.h - this.offset },
        { x: this.w / 2, y: this.h - this.offset },
        { x: this.w - this.offset, y: this.h - this.offset },
        // down to top
        { x: this.offset, y: this.h - this.offset },
        { x: this.w / 2, y: this.h - this.offset },
        { x: this.w - this.offset, y: this.h - this.offset },
        { x: this.offset, y: this.h / 2 },
        { x: this.w / 2, y: this.h / 2 },
        { x: this.w - this.offset, y: this.h / 2 },
        { x: this.offset, y: this.offset },
        { x: this.w / 2, y: this.offset },
        { x: this.w - this.offset, y: this.offset },
        // random points
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        // top to down
        { x: this.offset, y: this.offset },
        { x: this.w / 2, y: this.offset },
        { x: this.w - this.offset, y: this.offset },
        { x: this.offset, y: this.h / 2 },
        { x: this.w / 2, y: this.h / 2 },
        { x: this.w - this.offset, y: this.h / 2 },
        { x: this.offset, y: this.h - this.offset },
        { x: this.w / 2, y: this.h - this.offset },
        { x: this.w - this.offset, y: this.h - this.offset },
        // down to top
        { x: this.offset, y: this.h - this.offset },
        { x: this.w / 2, y: this.h - this.offset },
        { x: this.w - this.offset, y: this.h - this.offset },
        { x: this.offset, y: this.h / 2 },
        { x: this.w / 2, y: this.h / 2 },
        { x: this.w - this.offset, y: this.h / 2 },
        { x: this.offset, y: this.offset },
        { x: this.w / 2, y: this.offset },
        { x: this.w - this.offset, y: this.offset },
        // random points
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
        {
          x: this.rndNum(this.offset, this.w - this.offset),
          y: this.rndNum(this.offset, this.h - this.offset),
        },
      ];
    },
  },
};
</script>
