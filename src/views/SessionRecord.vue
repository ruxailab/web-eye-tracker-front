<template>
  <div class="session">
    <v-toolbar dense dark>
      <v-toolbar-title>Eye Lab</v-toolbar-title>
      <v-spacer />
      <v-col cols="4" class="pt-9">
        <v-text-field solo dense light placeholder="URL" v-model="url" />
      </v-col>
      <p class="pt-4">Educational proposal only.</p>
      <v-spacer />
      <v-toolbar-items>
        <v-row class="ma-0" align="center">
          <v-icon
            :color="recording.color"
            small
            :class="`${recording.isPaused ? 'blink' : ''}`"
            >mdi-record</v-icon
          >
          <p class="pt-4 pr-4 pl-2">
            {{ displayTime.hour }}:{{ displayTime.min }}:{{ displayTime.sec }}
          </p>
          <v-btn icon small @click="stopRecord()" :disabled="!recording.value">
            <v-icon color="red">mdi-stop-circle-outline</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            @click="pauseRecord()"
            :disabled="recording.isPaused || !recording.value ? true : false"
          >
            <v-icon>mdi-pause-circle-outline</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            @click="startRecord()"
            :disabled="recording.isPaused || !recording.value ? false : true"
          >
            <v-icon>mdi-play-circle-outline</v-icon>
          </v-btn>
        </v-row>
      </v-toolbar-items>
    </v-toolbar>
    <iframe :src="url" style="border: 0; width: 100%; height: 93%" />
  </div>
</template>

<script>
export default {
  name: "Session",
  data() {
    return {
      url: "",
      displayTime: {
        min: "00m",
        hour: "00h",
        sec: "00s",
      },
      recording: {
        value: false,
        color: "grey",
        isPaused: false,
      },
      min: 0,
      hour: 0,
      sec: 1,
      interval: null,
      configWebCam: {
        video: true,
        audio: false,
      },
      configScreen: {
        video: {
          cursor: "always",
        },
        audio: false,
      },
      recordScreen: null,
      recordWebCam: null,
    };
  },
  methods: {
    async startRecord() {
      if (this.recording.isPaused) {
        this.recordScreen.resume();
        this.recordWebCam.resume();
        this.startTimer();
      } else {
        await this.startScreenCapture();
        await this.startWebCamCapture();
        this.startTimer();
      }
    },
    stopRecord() {
      this.stopScreenCapture();
      this.stopWebCamCapture();
      this.stopTimer();
      this.recording.color = 'grey'
    },
    pauseRecord() {
      this.recordScreen.pause();
      this.pauseTimer();
    },
    startTimer() {
      this.recording.value = true;
      this.recording.color = "red";
      this.recording.isPaused = false;

      this.interval = window.setInterval(() => {
        if (this.sec == 60) {
          this.min++;
          this.sec = 0;
        }
        if (this.min == 60) {
          this.hour++;
          this.sec = 0;
          this.min = 0;
        }
        this.hour < 10
          ? (this.displayTime.hour = `0${this.hour}h`)
          : (this.displayTime.hour = `${this.hour}h`);
        this.min < 10
          ? (this.displayTime.min = `0${this.min}m`)
          : (this.displayTime.min = `${this.min}m`);
        this.sec < 10
          ? (this.displayTime.sec = `0${this.sec}s`)
          : (this.displayTime.sec = `${this.sec}m`);
        this.sec++;
      }, 1000);
    },
    pauseTimer() {
      this.recording.color = "red";
      this.recording.isPaused = true;
      window.clearInterval(this.interval);
    },
    stopTimer() {
      this.recording.color = "red";
      this.recording.isPaused = false;
      this.recording.value = false;
      this.min = 0;
      this.sec = 0;
      this.hour = 0;
      this.displayTime = {
        min: "00m",
        hour: "00h",
        sec: "00s",
      };
      window.clearInterval(this.interval);
    },
    stopScreenCapture() {
      this.recordScreen.stop();
    },
    async startScreenCapture() {
      // Request permission for screen capture
      return navigator.mediaDevices
        .getDisplayMedia(this.configScreen)
        .then((captureStream) => {
          // Create media recorder object
          this.recordScreen = new MediaRecorder(captureStream);
          let recordingScreen = [];

          // Define screen capture events

          // Save frames to recordingScreen array
          this.recordScreen.ondataavailable = function(ev) {
            recordingScreen.push(ev.data);
          };

          // OnStop Screen Record
          this.recordScreen.onstop = function() {
            // Generate blob from the frames
            let blob = new Blob(recordingScreen, { type: "video/mp4;" });
            recordingScreen = [];
            const uploadMediaScreen = { blob: blob, name: captureStream.id };
            const mediaScreen = window.URL.createObjectURL(blob);

            // End screen capture
            captureStream.getTracks().forEach((track) => track.stop());

            // TODO: Send to API
            console.log(uploadMediaScreen, mediaScreen);
          };

          // Init record screen
          this.recordScreen.start();
        })
        .catch((err) => {
          console.error("Error:" + err);
        });
    },
    async startWebCamCapture() {
      // Request permission for screen capture
      return navigator.mediaDevices
        .getUserMedia(this.configWebCam)
        .then((mediaStreamObj) => {
          // Create media recorder object
          this.recordWebCam = new MediaRecorder(mediaStreamObj);
          let recordingWebCam = [];

          // Define screen capture events

          // Save frames to recordingWebCam array
          this.recordWebCam.ondataavailable = (ev) => {
            recordingWebCam.push(ev.data);
          };

          // OnStop WebCam Record
          this.recordWebCam.onstop = () => {
            // Generate blob from the frames
            let blob = new Blob(recordingWebCam, { type: "video/mp4;" });
            recordingWebCam = [];
            const uploadMediaWebCam = { blob: blob, name: mediaStreamObj.id };
            const mediaWebCam = window.URL.createObjectURL(blob);

            // End webcam capture
            mediaStreamObj.getTracks().forEach((track) => track.stop());

            // TODO: Send to API
            console.log(uploadMediaWebCam, mediaWebCam);
          };

          // Init record webcam
          this.recordWebCam.start();
        })
        .catch((e) => console.log("Error", e));
    },
    stopWebCamCapture() {
      this.recordWebCam.stop();
    },
  },
};
</script>

<style scoped>
.session {
  height: 100%;
  overflow: hidden;
}
.blink {
  animation: blink 1s steps(1, end) infinite;
}
@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
