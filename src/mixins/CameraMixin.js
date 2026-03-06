/**
 * CameraMixin — Reusable webcam / MediaRecorder logic.
 *
 * Extracted from DoubleCalibrationRecord.vue (Issue #112).
 * Mix this into any Vue component that needs camera capture
 * and face-detection support.
 *
 * Requirements for the host component:
 *  - Must have a <video id="video-tag"> in its template (for ML inference).
 *  - Must have a <video id="video-preview"> in its template (for UI display).
 *  - Must provide `this.model` (the face-landmarks-detection model instance)
 *    and `this.configWebCam` (getUserMedia constraints) via its own
 *    data / computed / store.
 */

export default {
    data() {
        return {
            /** @type {MediaRecorder|null} */
            recordWebCam: null,
            /** Blob + name of the recorded webcam video */
            webcamfile: null,
        };
    },

    methods: {
        /**
         * Request camera access, wire up MediaRecorder, and start recording.
         * Resolves once the video element fires `loadeddata`.
         */
        async startWebCamCapture() {
            try {
                let mediaStreamObj;

                try {
                    // Try with ideal constraints first
                    mediaStreamObj = await navigator.mediaDevices.getUserMedia(
                        this.configWebCam,
                    );
                } catch (error) {
                    console.warn(
                        'Failed with ideal constraints, trying basic video:',
                        error,
                    );
                    mediaStreamObj = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: true,
                    });
                }

                // Create media recorder
                this.recordWebCam = new MediaRecorder(mediaStreamObj, {
                    mimeType: 'video/webm;',
                });

                let recordingWebCam = [];
                const video = document.getElementById('video-tag'); // ML
                const preview = document.getElementById('video-preview'); // UI

                if (!video || !preview) {
                    console.error('Video elements not found');
                    return;
                }

                video.srcObject = mediaStreamObj;
                preview.srcObject = mediaStreamObj;

                // Save frames
                this.recordWebCam.ondataavailable = (ev) => {
                    recordingWebCam.push(ev.data);
                };

                // On stop → build blob
                const self = this;
                this.recordWebCam.onstop = () => {
                    const blob = new Blob(recordingWebCam, { type: 'video/webm' });
                    recordingWebCam = [];
                    self.webcamfile = { blob, name: mediaStreamObj.id };
                    mediaStreamObj.getTracks().forEach((track) => track.stop());
                    self.stopRecord();
                };

                // Start recording
                this.recordWebCam.start();

                // Wait for video to be ready
                return new Promise((resolve) => {
                    video.onloadeddata = () => {
                        this.detectFace();
                        resolve();
                    };
                });
            } catch (e) {
                console.error('Error accessing webcam:', e);
                alert(
                    'Camera access is required for eye tracking. Please allow camera permissions and refresh the page.',
                );
                throw e;
            }
        },

        /**
         * Run face-landmark detection on the current video frame.
         * Retries automatically if the video isn't ready yet.
         *
         * @returns {Promise<Array>} Face predictions from the model.
         */
        async detectFace() {
            const video = document.getElementById('video-tag');

            if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
                console.warn('Video not ready yet, waiting...');
                await new Promise((resolve) => setTimeout(resolve, 100));
                return this.detectFace();
            }

            const lastPrediction = await this.model.estimateFaces({ input: video });
            return lastPrediction;
        },

        /**
         * Stop the MediaRecorder if it is still active.
         */
        async stopRecord() {
            if (!this.recordWebCam) return;
            if (this.recordWebCam.state !== 'inactive') {
                await this.stopWebCamCapture();
            }
        },

        /**
         * Stop the MediaRecorder and mark calibration as finished.
         */
        async stopWebCamCapture() {
            await this.recordWebCam.stop();
            this.calibFinished = true;
        },
    },
};
