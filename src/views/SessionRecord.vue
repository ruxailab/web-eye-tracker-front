<template>
  <div class="session">
    <v-toolbar dense dark>
      <v-toolbar-title>Eye Lab</v-toolbar-title>
      <v-spacer />
      <v-col cols="4" class="pt-9">
        <v-text-field solo dense light placeholder="URL" v-model="url" />
      </v-col>
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
          <v-btn icon small @click="stopTimer()" :disabled="!recording.value">
            <v-icon color="red">mdi-stop-circle-outline</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            @click="pauseTimer()"
            :disabled="recording.isPaused || !recording.value ? true : false"
          >
            <v-icon>mdi-pause-circle-outline</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            @click="startTimer()"
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
    };
  },
  methods: {
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
          min: '00m',
          hour: '00h',
          sec: '00s'
      }
      window.clearInterval(this.interval);
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
