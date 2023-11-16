<template>
    <v-row class="d-flex align-center">
        <v-col cols="10">
            <Slider :value="offset" :min="Number(50)" :max="Number(200)" label="offset" @input="updateOffset" />
        </v-col>
        <v-col cols="2" style="max-width: 100%; max-height: 100%; display: flex; align-items: stretch;">
            <canvas id="offCanvas" style="width: 100%; height: 100%;"></canvas>
        </v-col>
    </v-row>
</template>
  
<script>
import Slider from "@/components/general/Slider.vue";

export default {
    components: {
        Slider,
    },
    computed: {
        offset() {
            return Number(this.$store.state.calibration.offset ?? 0);
        },
        pointNumber() {
            return Number(this.$store.state.calibration.pointNumber ?? 0)
        },
    },
    methods: {
        updateOffset(value) {
            this.$store.commit('setOffset', value);
        },
        drawOffset(offset, pointNum) {
            const canvas = document.getElementById("offCanvas");
            const ctx = canvas.getContext("2d");
            const xFac = canvas.width / window.innerWidth;
            const trueOffset = offset * xFac;
            const h = canvas.height;
            const w = canvas.width;

            const callibPoints = this.generatePoints(trueOffset, w, h, pointNum);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "red";
            callibPoints.forEach((point) => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            });
        },
        generatePoints(offset, canvasWidth, canvasHeight, pointNum) {
            const possiblePatterns = [
                [
                    { x: canvasWidth / 2, y: canvasHeight / 2 }
                ],
                [
                    { x: offset, y: canvasHeight / 2 },
                    { x: canvasWidth - offset, y: canvasHeight / 2 }
                ],
                [
                    { x: offset, y: canvasHeight / 2 },
                    { x: canvasWidth / 2, y: offset },
                    { x: canvasWidth - offset, y: canvasHeight / 2 }
                ],
                [
                    { x: offset, y: offset },
                    { x: canvasWidth - offset, y: offset },
                    { x: offset, y: canvasHeight - offset },
                    { x: canvasWidth - offset, y: canvasHeight - offset }
                ],
                [
                    { x: offset, y: offset },
                    { x: canvasWidth - offset, y: offset },
                    { x: canvasWidth / 2, y: canvasHeight / 2 },
                    { x: offset, y: canvasHeight - offset },
                    { x: canvasWidth - offset, y: canvasHeight - offset },
                ],
                [
                    { x: offset, y: offset },
                    { x: offset, y: canvasHeight / 2 },
                    { x: offset, y: canvasHeight - offset },
                    { x: canvasWidth - offset, y: offset },
                    { x: canvasWidth - offset, y: canvasHeight / 2 },
                    { x: canvasWidth - offset, y: canvasHeight - offset },
                ],
                [
                    { x: offset, y: offset },
                    { x: offset, y: canvasHeight / 2 },
                    { x: offset, y: canvasHeight - offset },
                    { x: canvasWidth / 2, y: canvasHeight / 2 },
                    { x: canvasWidth - offset, y: offset },
                    { x: canvasWidth - offset, y: canvasHeight / 2 },
                    { x: canvasWidth - offset, y: canvasHeight - offset },
                ],
                [
                    { x: offset, y: offset },
                    { x: offset, y: canvasHeight / 2 },
                    { x: offset, y: canvasHeight - offset },
                    { x: canvasWidth / 2, y: offset },
                    { x: canvasWidth / 2, y: canvasHeight - offset },
                    { x: canvasWidth - offset, y: offset },
                    { x: canvasWidth - offset, y: canvasHeight / 2 },
                    { x: canvasWidth - offset, y: canvasHeight - offset },
                ],
                [
                    { x: offset, y: offset },
                    { x: offset, y: canvasHeight / 2 },
                    { x: offset, y: canvasHeight - offset },
                    { x: canvasWidth / 2, y: offset },
                    { x: canvasWidth / 2, y: canvasHeight / 2 },
                    { x: canvasWidth / 2, y: canvasHeight - offset },
                    { x: canvasWidth - offset, y: offset },
                    { x: canvasWidth - offset, y: canvasHeight / 2 },
                    { x: canvasWidth - offset, y: canvasHeight - offset },
                ]
            ]
            const pattern = possiblePatterns.find(pattern => pattern.length === pointNum)
            return pattern;
        },
    },
    watch: {
        offset(newOffset) {
            this.drawOffset(newOffset, this.pointNumber);
        },
        pointNumber(newPointNumber) {
            this.drawOffset(this.offset, newPointNumber);
        }
    },
    mounted() {
        this.drawOffset(this.offset, this.pointNumber)
    },
};
</script>