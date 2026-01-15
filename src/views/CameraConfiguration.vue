<template>
    <div id="box" style="text-align: center;">
        <Toolbar v-if="!fromRuxailab" />
        <v-container class="mt-4" style="max-height: calc(100vh - 80px); overflow: hidden;">
            <v-row justify="center" style="height: 100%;">
                <!-- Instructions Card -->
                <v-col cols="12" class="text-center">
                    <v-alert type="info" outlined prominent class="mx-auto py-2"
                        style="max-width: 600px; font-size: 0.85rem;">
                        <div class="d-flex align-center">
                            <v-icon medium left>mdi-information</v-icon>
                            <div class="text-left">
                                <strong>Camera Setup</strong>
                                <p class="mb-0 mt-1" style="font-size: 0.8rem;">Position your face within the guide.
                                    Ensure both eyes are visible.</p>
                            </div>
                        </div>
                    </v-alert>
                </v-col>

                <!-- Camera Selection -->
                <v-col cols="12" lg="8" md="10" class="px-6 py-1">
                    <v-select v-model="selectedMediaDevice" :items="mediaDevices" item-text="label"
                        item-value="deviceId" label="Select Camera" outlined dense
                        prepend-inner-icon="mdi-camera"></v-select>
                </v-col>

                <!-- Blink Threshold Configuration -->
                <v-col v-if="!fromRuxailab" cols="12" lg="8" md="10" class="py-1">
                    <BlinkTresholdCard />
                </v-col>

                <!-- Camera Preview -->
                <v-col cols="12" lg="8" md="10" class="py-1">
                    <v-card outlined class="camera-preview-card" style="height: 100%;">
                        <v-card-title class="justify-center py-2" style="font-size: 0.95rem;">
                            <v-icon small left>mdi-camera-iris</v-icon>
                            Camera Preview
                        </v-card-title>
                        <v-card-text class="pa-2">
                            <div v-if="isModelLoaded" class="camera-wrapper">
                                <video id="video-tag" autoplay playsinline />
                                <canvas id="canvas" />
                                <v-img v-if="isCameraOn" class="mask" src="@/assets/mask_desktop.svg" />
                            </div>
                            <div v-else class="loading-container" style="min-height: 200px;">
                                <v-progress-circular :size="40" :width="6" color="green"
                                    indeterminate></v-progress-circular>
                                <h4 class="mt-2">Loading face detection model...</h4>
                            </div>
                        </v-card-text>
                        <v-card-actions class="justify-center pb-2">
                            <v-btn class="calibration-btn" large dark color="green" :disabled="!isCameraOn"
                                @click="goToCalibRecord()">
                                <v-icon small left>mdi-play</v-icon>
                                Start Calibration
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import Toolbar from "@/components/general/Toolbar.vue";
import BlinkTresholdCard from "@/components/calibration/BlinkTresholdCard.vue";

const tf = require("@tensorflow/tfjs");
const faceLandmarksDetection = require("@tensorflow-models/face-landmarks-detection");
require('@tensorflow/tfjs-backend-wasm');

export default {
    components: {
        Toolbar,
        BlinkTresholdCard
    },
    data() {
        return {
            isCameraOn: false,
            webcamStream: null,
            video: null,
            fromRuxailab: false,
            mediaDevices: [],
            selectedMediaDevice: null
        };
    },
    computed: {
        model() {
            return this.$store.state.detect.model
        },
        isModelLoaded() {
            return this.$store.state.detect.loaded
        },
        predictions() {
            return this.$store.state.detect.predictions
        },
        calibName() {
            return this.$store.state.calibration.calibName
        },
        blinkFilter() {
            return this.$store.state.calibration.blinkFilter
        },
        leftEyeTreshold() {
            return this.$store.state.calibration.leftEyeTreshold
        },
        rightEyeTreshold() {
            return this.$store.state.calibration.rightEyeTreshold
        },
    },
    watch: {
        selectedMediaDevice(newDeviceId) {
            this.restartCameraWithDevice(newDeviceId);
        },
        predictions: {
            handler() {
                this.detectFace();
            },
            deep: true,
        },
    },
    mounted() {
        this.setupCamera()
        this.verifyFromRuxailab()
    },
    methods: {
        async setupCamera() {
            // Load the faceLandmarksDetection model assets.
            const model = await faceLandmarksDetection.load(
                faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
                { maxFaces: 1 }
            );

            this.$store.commit('setModel', model);
            this.$store.commit('setLoaded', (model != null));

            this.$nextTick(async () => {
                this.video = document.getElementById("video-tag");

                // Fetch available media devices
                this.mediaDevices = await navigator.mediaDevices.enumerateDevices();

                // Filter video input devices
                const videoDevices = this.mediaDevices.filter(device => device.kind === 'videoinput');

                // Set default selected media device if not set
                if (!this.selectedMediaDevice && videoDevices.length > 0) {
                    this.selectedMediaDevice = videoDevices[0].deviceId;
                }

                navigator.mediaDevices
                    .getUserMedia({
                        audio: false,
                        video: { deviceId: this.selectedMediaDevice, width: 600, height: 500 },
                    })
                    .then((stream) => {
                        // stream is a MediaStream object
                        this.video.srcObject = stream;

                        this.webcamStream = stream;

                        tf.getBackend();

                        this.video.onloadeddata = () => {
                            const canvas = document.getElementById("canvas");

                            
                            canvas.width = this.video.videoWidth || 500;
                            canvas.height = this.video.videoHeight || 400;

                            this.isCameraOn = true;
                            this.detectFace();
                        };
                    });
            });
        },
        async restartCameraWithDevice(deviceId) {
            if (this.webcamStream) {
                this.webcamStream.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: { deviceId: deviceId, width: 600, height: 500 },
                audio: false
            };

            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                this.video.srcObject = stream;
                this.webcamStream = stream;

                this.video.onloadeddata = () => {
                    this.isCameraOn = true;
                    this.detectFace();
                };
            } catch (err) {
                console.error("Erro ao acessar dispositivo de vídeo:", err);
            }
        },
        async detectFace() {
            let canvas = document.getElementById("canvas");
            let ctx = canvas.getContext("2d");
            let prediction = await this.model.estimateFaces({
                input: this.video,
            })
            this.$store.commit('setPredictions', prediction)
            canvas.width = this.video.videoWidth || 500;
            canvas.height = this.video.videoHeight || 400;
            ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height)

            const th = this

            this.predictions.forEach((pred) => {
                // left eye
                const leftIris = pred.annotations.leftEyeIris;
                const leftEyelid = pred.annotations.leftEyeUpper0.concat(pred.annotations.leftEyeLower0);
                const leftEyelidTip = leftEyelid[3]
                const leftEyelidBottom = leftEyelid[11]
                const isLeftBlink = this.calculateDistance(leftEyelidTip, leftEyelidBottom) < th.leftEyeTreshold
                th.blinkFilter ? this.drawEye(leftIris, leftEyelid, ctx, isLeftBlink) : this.drawEye(leftIris, leftEyelid, ctx, false)

                // right eye
                const rightIris = pred.annotations.rightEyeIris;
                const rightEyelid = pred.annotations.rightEyeUpper0.concat(pred.annotations.rightEyeLower0);
                const rightEyelidTip = rightEyelid[3]
                const rightEyelidBottom = rightEyelid[11]
                const isRightBlink = this.calculateDistance(rightEyelidTip, rightEyelidBottom) < th.rightEyeTreshold
                th.blinkFilter ? this.drawEye(rightIris, rightEyelid, ctx, isRightBlink) : this.drawEye(rightIris, rightEyelid, ctx, false)

                // face contour
                this.drawFace(ctx, pred)
            });
        },
        calculateDistance(eyelidTip, eyelidBottom) {
            const xDistance = eyelidBottom[0] - eyelidTip[0];
            const yDistance = eyelidBottom[1] - eyelidTip[1];
            const distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
            return distance;
        },
        drawEye(iris, eyelid, ctx, isBlink) {
            if (isBlink) {
                ctx.fillStyle = 'red'
                for (let i = 0; i < eyelid.length; i++) {
                    ctx.fillRect(eyelid[i][0], eyelid[i][1], 3, 3);
                }
            } else {
                ctx.fillStyle = 'yellow'
                for (let i = 0; i < eyelid.length; i++) {
                    ctx.fillRect(eyelid[i][0], eyelid[i][1], 3, 3);
                }
                ctx.fillStyle = 'blue'
                ctx.fillRect(eyelid[3][0], eyelid[3][1], 3, 3);
                ctx.fillRect(eyelid[11][0], eyelid[11][1], 3, 3);
                ctx.fillStyle = 'red'
                ctx.fillRect(
                    iris[0][0],
                    iris[0][1],
                    3,
                    3
                );
            }

        },
        drawFace(ctx, pred) {
            ctx.beginPath();
            ctx.lineWidth = "4";
            ctx.strokeStyle = "blue";
            ctx.rect(
                pred.boundingBox.topLeft[0],
                pred.boundingBox.topLeft[1],
                pred.boundingBox.bottomRight[0] - pred.boundingBox.topLeft[0],
                pred.boundingBox.bottomRight[1] - pred.boundingBox.topLeft[1]
            );
            ctx.stroke();
        },
        fullScreen() {
            var element = document.documentElement;
            if (element.requestFullscreen) {
                if (!document.fullscreenElement) {
                    element.requestFullscreen().catch((err) => {
                        console.error("Erro ao entrar em tela cheia:", err);
                    });
                } else {
                    document.exitFullscreen();
                }
            } else if (element.mozRequestFullScreen) {
                // Para o Firefox
                if (!document.mozFullScreenElement) {
                    element.mozRequestFullScreen().catch((err) => {
                        console.error("Erro ao entrar em tela cheia:", err);
                    });
                } else {
                    document.mozCancelFullScreen();
                }
            } else if (element.webkitRequestFullscreen) {
                // Para o Chrome, Safari e Opera
                if (!document.webkitFullscreenElement) {
                    element.webkitRequestFullscreen().catch((err) => {
                        console.error("Erro ao entrar em tela cheia:", err);
                    });
                } else {
                    document.webkitExitFullscreen();
                }
            } else if (element.msRequestFullscreen) {
                // Para o Internet Explorer e Microsoft Edge
                if (!document.msFullscreenElement) {
                    element.msRequestFullscreen().catch((err) => {
                        console.error("Erro ao entrar em tela cheia:", err);
                    });
                } else {
                    document.msExitFullscreen();
                }
            }
        },
        goToCalibRecord() {
            this.webcamStream.getTracks().forEach((track) => {
                track.stop();
            });
            const urlParams = new URLSearchParams(window.location.search);
            if (this.fromRuxailab) this.$router.push(`/calibration/record?auth=${this.calibName}&test=${urlParams.get('test')}`);
            else this.$router.push("/calibration/record");
        },
        verifyFromRuxailab() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('auth') && urlParams.has('test')) {
                const auth = urlParams.get('auth');
                this.$store.commit('setCalibName', auth);
                this.fromRuxailab = true
            }
        },
    },
};
</script>

<style scoped>
.loading-container {
    text-align: center;
    margin-top: 8rem;
}

.centered-canvas {
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.calibration-btn {
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: none;
}

.camera-preview-card {
    border: 2px solid #e0e0e0;
    border-radius: 12px;
}

.camera-wrapper {
    position: relative;
    width: 500px;
    height: 400px;
    margin: 0 auto;
}

#video-tag,
#canvas,
.mask {
    position: absolute;
    inset: 0;
    width: 500px;
    height: 400px;
    object-fit: cover;
}


.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: #555;
}
</style>