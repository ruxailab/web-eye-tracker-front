<template>
    <div id="box" style="text-align: center;">
        <Toolbar />
        <v-container class="mt-12">
            <v-row justify="center">
                <v-col cols="12" lg="7" md="7">
                    <div v-if="!isModelLoaded && isCameraOn" class="loading-container">
                        <v-progress-circular :size="50" :width="7" color="black" indeterminate></v-progress-circular>
                        <h2 class="ml-4">Loading model...</h2>
                    </div>

                    <div style="position: relative; display: flex; justify-content: center; align-items: center;">
                        <video autoplay id="video-tag"
                            style="max-width: 100%; max-height: 100%;"></video>
                        <canvas id="canvas" width="600" height="500" style="position: absolute; top: 0; left: 0;"></canvas>
                        <v-img v-if="isModelLoaded" style="height: 500px; width: 800px; position: absolute;"
                            src="@/assets/mask_desktop.svg">
                        </v-img>
                    </div>

                    <v-btn class="calibration-btn" outlined color="green" :disabled="!isCameraOn"
                        @click="goToCallibRecord()">
                        Start Calibration
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
  
<script>
import Toolbar from "@/components/Toolbar.vue";
const tf = require("@tensorflow/tfjs");
const faceLandmarksDetection = require("@tensorflow-models/face-landmarks-detection");

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
            webcamStream: null,
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
    mounted() {
        this.setupCamera()
    },
    methods: {
        fullScreen() {
            // Obtenha o elemento que você deseja colocar em tela cheia (por exemplo, um elemento de vídeo ou um elemento de div).
            var element = document.documentElement; // Use document.documentElement para a página inteira.

            // Verifique se o modo de tela cheia já está ativado.
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
        goToCallibRecord() {
            this.webcamStream.getTracks().forEach((track) => {
                track.stop();
            });

            this.fullScreen();
            this.$router.push("/callibration/record");
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

                    this.webcamStream = stream;

                    await tf.getBackend();
                    // Load the faceLandmarksDetection model assets.
                    this.model = await faceLandmarksDetection.load(
                        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
                    );

                    this.isModelLoaded = true;
                    this.detectFace();
                });
        },
        async detectFace() {
            let video = document.getElementById("video-tag");
            let canvas = document.getElementById("canvas");
            let ctx = canvas.getContext("2d");

            this.predictions = await this.model.estimateFaces({
                input: document.getElementById("video-tag"),
            });

            // draw the video first
            ctx.drawImage(video, 0, 0, 600, 500);
            this.predictions.forEach((pred) => {
                // draw the rectangle enclosing the face
                ctx.fillStyle = "red";

                // left iris
                ctx.fillRect(
                    pred.scaledMesh[468]["0"],
                    pred.scaledMesh[468]["1"],
                    5,
                    5
                );

                // right iris
                ctx.fillRect(
                    pred.scaledMesh[473]["0"],
                    pred.scaledMesh[473]["1"],
                    5,
                    5
                );

                // face contour
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
            });
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
    max-width: 200px;
    height: 30px;
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
}
</style>