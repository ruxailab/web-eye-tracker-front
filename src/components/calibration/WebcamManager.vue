<template>
  <video 
    id="video-tag" 
    autoplay 
    playsinline
    style="display: none;"
    @loadedmetadata="onMetadataLoaded"
  ></video>
</template>

<script>
export default {
  name: 'WebcamManager',
  data() {
    return {
      recordWebCam: null,
      webcamfile: null,
      configWebCam: {
        audio: false,
        video: true
      }
    }
  },
  beforeDestroy() {
    this.stopWebCamCapture();
  },
  methods: {
    async startWebCamCapture() {
      try {
        const mediaStreamObj = await navigator.mediaDevices.getUserMedia(this.configWebCam);
        
        // Create media recorder object
        this.recordWebCam = new MediaRecorder(mediaStreamObj, {
          mimeType: "video/webm;",
        });

        let recordingWebCam = [];
        let video = document.getElementById("video-tag");
        video.srcObject = mediaStreamObj;
        
        // Save frames to recordingWebCam array
        this.recordWebCam.ondataavailable = (ev) => {
          recordingWebCam.push(ev.data);
        };
        
        // OnStop WebCam Record
        this.recordWebCam.onstop = () => {
          // Generate blob from the frames
          let blob = new Blob(recordingWebCam, { type: "video/webm" });
          recordingWebCam = [];
          this.webcamfile = { blob: blob, name: mediaStreamObj.id };
          
          // End webcam capture
          mediaStreamObj.getTracks().forEach((track) => track.stop());
          this.$emit('capture-stopped', this.webcamfile);
        };

        // Init record webcam
        this.recordWebCam.start();
        return true;
      } catch (e) {
        console.error("Error starting webcam:", e);
        this.$emit('error', e);
        return false;
      }
    },
    
    async onMetadataLoaded() {
      // Additional wait to ensure video renders properly
      await new Promise(resolve => setTimeout(resolve, 200));
      const video = document.getElementById("video-tag");
      if (video && video.videoWidth > 0 && video.videoHeight > 0) {
        this.$emit('video-ready', video);
      }
    },

    async stopRecord() {
      if (!this.recordWebCam) return;
      if (this.recordWebCam.state !== "inactive") {
        await this.stopWebCamCapture();
      }
    },

    async stopWebCamCapture() {
      if (this.recordWebCam && this.recordWebCam.state !== 'inactive') {
        this.recordWebCam.stop();
      }
    }
  }
}
</script>
