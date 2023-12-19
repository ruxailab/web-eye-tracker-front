<template>
    <v-row class="d-flex align-center">
        <v-col cols="8">
            <Slider :value="offset" :min="Number(50)" :step="5" :max="Number(200)" label="offset" @input="updateOffset" />
        </v-col>
        <v-col cols="4" style="max-width: 100%; max-height: 100%; display: flex; align-items: stretch;">
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
        backgroundColor() {
            return this.$store.state.calibration.backgroundColor
        },
    },
    methods: {
        updateOffset(value) {
            this.$store.commit('setOffset', value);
        },
        updatePattern(value) {
            this.$store.commit('setPattern', value);
        },
        drawOffset(offset, pointNum, backgroundColor) {
            const canvas = document.getElementById("offCanvas");
            const ctx = canvas.getContext("2d");
            const xFac = canvas.width / window.innerWidth;
            const yFac = canvas.height / window.innerHeight;
            const trueOffsetX = offset * xFac;
            const trueOffsetY = offset * yFac;
            const h = canvas.height;
            const w = canvas.width;

            const canvasCalib = this.generatePoints(trueOffsetX, trueOffsetY, w, h, pointNum);
            const trueCalib = this.generatePoints(offset, offset, window.innerWidth, window.innerHeight, pointNum);
            this.updatePattern(trueCalib);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "red";
            canvasCalib.forEach((point) => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            });
        },
        generatePoints(offsetX, offsetY, width, height, pointNum) {
            const possiblePatterns = [
                [
                    { x: offsetX, y: height - offsetY },
                    { x: width - offsetX, y: offsetY },
                ],
                [
                    { x: offsetX, y: height - offsetY },
                    { x: width / 2, y: height / 2 },
                    { x: width - offsetX, y: offsetY },
                ],
                [
                    { x: offsetX, y: offsetY },
                    { x: width - offsetX, y: offsetY },
                    { x: offsetX, y: height - offsetY },
                    { x: width - offsetX, y: height - offsetY }
                ],
                [
                    { x: offsetX, y: offsetY },
                    { x: width - offsetX, y: offsetY },
                    { x: width / 2, y: height / 2 },
                    { x: offsetX, y: height - offsetY },
                    { x: width - offsetX, y: height - offsetY },
                ],
                [
                    { x: offsetX, y: offsetY },
                    { x: offsetX, y: height / 2 },
                    { x: offsetX, y: height - offsetY },
                    { x: width - offsetX, y: offsetY },
                    { x: width - offsetX, y: height / 2 },
                    { x: width - offsetX, y: height - offsetY },
                ],
                [
                    { x: offsetX, y: offsetY },
                    { x: offsetX, y: height / 2 },
                    { x: offsetX, y: height - offsetY },
                    { x: width / 2, y: height / 2 },
                    { x: width - offsetX, y: offsetY },
                    { x: width - offsetX, y: height / 2 },
                    { x: width - offsetX, y: height - offsetY },
                ],
                [
                    { x: offsetX, y: offsetY },
                    { x: offsetX, y: height / 2 },
                    { x: offsetX, y: height - offsetY },
                    { x: width / 2, y: offsetY },
                    { x: width / 2, y: height - offsetY },
                    { x: width - offsetX, y: offsetY },
                    { x: width - offsetX, y: height / 2 },
                    { x: width - offsetX, y: height - offsetY },
                ],
                [
                    { x: offsetX, y: offsetY },
                    { x: offsetX, y: height / 2 },
                    { x: offsetX, y: height - offsetY },
                    { x: width / 2, y: offsetY },
                    { x: width / 2, y: height / 2 },
                    { x: width / 2, y: height - offsetY },
                    { x: width - offsetX, y: offsetY },
                    { x: width - offsetX, y: height / 2 },
                    { x: width - offsetX, y: height - offsetY },
                ]
            ]
            const pattern = possiblePatterns.find(pattern => pattern.length === pointNum)
            return pattern;
        },
    },
    watch: {
        offset(newOffset) {
            this.drawOffset(newOffset, this.pointNumber, this.backgroundColor);
        },
        pointNumber(newPointNumber) {
            this.drawOffset(this.offset, newPointNumber, this.backgroundColor);
        },
        backgroundColor(newBackgroundColor) {
            this.drawOffset(this.offset, this.pointNumber, newBackgroundColor)
        },
    },
    mounted() {
        this.drawOffset(this.offset, this.pointNumber, this.backgroundColor)
    },
};
</script>