<template>
    <div id="box" style="height: 100vh; overflow: hidden;">
        <Toolbar v-if="!fromRuxailab" />
        
        <!-- Camera Selection Modal -->
        <v-dialog v-model="showCameraModal" max-width="500">
            <v-card class="blue-bg">
                <v-card-title class="d-flex justify-center white--text pb-4 pt-6">
                    <v-icon color="white" left size="32">mdi-camera</v-icon>
                    <span style="font-size: 20px;">Select Camera</span>
                </v-card-title>
                <v-card-text class="px-6 pb-2">
                    <p class="white--text text-center mb-4" style="font-size: 14px;">
                        If you don't see your face correctly, please select the correct camera from the list below.
                    </p>
                    <v-select 
                        v-model="selectedMediaDevice" 
                        :items="mediaDevices" 
                        item-text="label"
                        item-value="deviceId" 
                        label="Available Cameras" 
                        outlined
                        dark
                        color="#FF425A"
                        item-color="#FF425A"
                        prepend-inner-icon="mdi-camera"
                        background-color="rgba(255, 255, 255, 0.1)"
                    ></v-select>
                </v-card-text>
                <v-card-actions class="justify-center px-6 pb-6">
                    <v-btn color="#FF425A" dark block large @click="showCameraModal = false">
                        <v-icon left>mdi-check</v-icon>
                        Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-container fluid style="height: calc(100vh - 64px); overflow-y: auto; overflow-x: hidden;">
            <v-row justify="center" align="center" style="min-height: 100%;">
                <v-col cols="12" md="10" lg="8" xl="6">
                    <v-stepper v-model="setupStep" elevation="0" class="mx-auto compact-stepper">
                        <v-stepper-header>
                            <v-stepper-step :complete="setupStep > 1" step="1" color="#FF425A">
                                Camera Setup
                            </v-stepper-step>
                            <v-divider></v-divider>
                            <v-stepper-step :complete="setupStep > 2" step="2" color="#FF425A">
                                Preview & Calibration
                            </v-stepper-step>
                        </v-stepper-header>

                        <v-stepper-items>
                            <!-- Step 1: Instructions -->
                            <v-stepper-content step="1" class="compact-content">
                            <v-card flat>
                                <v-card-text class="text-center py-2">
                                    <div class="mb-2">
                                        <v-icon size="64" color="#FF425A">mdi-camera-iris</v-icon>
                                    </div>
                                    <v-alert color="#fff"  dense class="mb-3">
                                        <h4 class="mb-2 text-center">What will happen:</h4>
                                        <div class="text-left mx-auto" style="max-width: 400px; font-size: 16px;">
                                            <ul class="compact-list">
                                                <li>The system will request camera permission</li>
                                                <li>Your webcam image will appear with a face guide</li>
                                                <li>Position your face inside the mask overlay</li>
                                                <li>Make sure both eyes are clearly visible</li>
                                            </ul>
                                        </div>
                                    </v-alert>
                                    <v-alert outlined color="#FF425A" dense class="mx-auto" style="max-width: 400px; font-size: 14px;">
                                        <strong>Important:</strong> Please allow camera access when prompted.
                                    </v-alert>
                                </v-card-text>
                            </v-card>
                            <div class="text-center pb-2">
                                <v-btn color="#FF425A" dark @click="startCameraSetup">
                                    <v-icon left>mdi-arrow-right</v-icon>
                                    Continue
                                </v-btn>
                            </div>
                        </v-stepper-content>

                        <!-- Step 2: Camera Preview -->
                        <v-stepper-content step="2" class="compact-content">
                            <v-card flat>
                                <!-- Blink Threshold Configuration -->
                                <v-card-text v-if="!fromRuxailab" class="pb-1 pt-2 text-center">
                                    <BlinkTresholdCard />
                                </v-card-text>

                                <!-- Camera Preview -->
                                <v-card-text class="pa-2 text-center">
                                    <div class="d-flex justify-center mb-2">
                                        <v-btn x-small outlined color="#002D51" @click="showCameraModal = true">
                                            <v-icon left x-small>mdi-help-circle</v-icon>
                                            Camera Help
                                        </v-btn>
                                    </div>
                                    <div v-if="isModelLoaded" class="camera-wrapper mx-auto" style="max-height: 400px;">
                                        <video id="video-tag" autoplay playsinline />
                                        <canvas id="canvas" />
                                        <v-img v-if="isCameraOn" class="mask" src="@/assets/mask_desktop.svg" />
                                    </div>
                                    <div v-else class="loading-container" style="min-height: 300px;">
                                        <v-progress-circular :size="50" :width="6" color="#FF425A"
                                            indeterminate></v-progress-circular>
                                        <h4 class="mt-3">Loading face detection model...</h4>
                                    </div>
                                </v-card-text>

                                <v-card-actions class="justify-center py-2">
                                    <v-btn text @click="setupStep = 1" class="mr-2">
                                        <v-icon left>mdi-arrow-left</v-icon>
                                        Back
                                    </v-btn>
                                    <v-btn color="#FF425A" dark :disabled="!isCameraOn" @click="goToCalibRecord()">
                                        <v-icon left>mdi-play</v-icon>
                                        Start Calibration
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-stepper-content>
                        </v-stepper-items>
                    </v-stepper>
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
            selectedMediaDevice: null,
            setupStep: 1,
            showCameraModal: false,
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
        this.verifyFromRuxailab()
    },
    methods: {
        startCameraSetup() {
            this.setupStep = 2;
            this.setupCamera();
        },
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
/* Ruxailab Color Palette */
.coral-bg {
    background-color: #FF425A !important;
}

.blue-bg {
    background-color: #002D51 !important;
}

/* Compact Stepper Styles */
.compact-stepper {
    max-height: calc(100vh - 100px);
}

.compact-content {
    padding: 8px 16px !important;
}

.compact-list {
    margin: 0;
    padding-left: 20px;
}

.compact-list li {
    margin-bottom: 4px;
}

.v-stepper__header {
    box-shadow: none !important;
    background-color: #002D51 !important;
    border-radius: 50px !important;
    padding: 0px !important;
}

.compact-stepper {
    border-radius: 12px !important;
    overflow: hidden !important;
}

.compact-stepper .v-stepper__step__step {
    background-color: rgba(255, 255, 255, 0.3) !important;
    color: white !important;
}

.compact-stepper .v-stepper__step--active .v-stepper__step__step {
    background-color: #FF425A !important;
    color: white !important;
}

.compact-stepper .v-stepper__step--complete .v-stepper__step__step {
    background-color: #FF425A !important;
    color: white !important;
}

.compact-stepper .v-stepper__step .v-stepper__label {
    color: white !important;
    text-shadow: none !important;
}

.compact-stepper .v-stepper__step--active .v-stepper__label {
    color: white !important;
}

.compact-stepper .v-stepper__step--complete .v-stepper__label {
    color: white !important;
}

.compact-stepper .v-divider {
    border-color: rgba(255, 255, 255, 0.3) !important;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #555;
}

.camera-wrapper {
    position: relative;
    width: 100%;
    max-width: 500px;
    height: auto;
    aspect-ratio: 5/4;
    margin: 0 auto;
    border: 5px solid #FF425A;
    border-radius: 12px;
    overflow: hidden;
}

#video-tag,
#canvas,
.mask {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

#video-tag {
    transform: scaleX(-1);
}

#canvas {
    transform: scaleX(-1);
}

.mask {
    pointer-events: none;
}
</style>

<style>
/* Global stepper label styling - without scoped */
.v-stepper__label {
    color: white !important;
    font-size: 16px !important;
    font-weight: 600 !important;
}
</style>