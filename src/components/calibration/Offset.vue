<template>
    <v-row class="d-flex align-center">
        <v-col cols="8">
            <Slider :value="offset" :min="Number(100)" :step="5" :max="Number(100)" label="offset" @input="updateOffset" />
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
            return Number(this.$store.state.calibration.offset ?? 0); // Retrieves the current offset from Vuex store
        },
        pointNumber() {
            return Number(this.$store.state.calibration.pointNumber ?? 0); // Retrieves the number of points for calibration
        },
        backgroundColor() {
            return this.$store.state.calibration.backgroundColor; // Retrieves the background color from Vuex store
        },
    },
    methods: {
        updateOffset(value) {
            this.$store.commit('setOffset', value); // Updates the offset in Vuex store
        },
        updatePattern(value) {
            this.$store.commit('setPattern', value); // Updates the pattern in Vuex store
        },
        drawOffset(offset, pointNum, backgroundColor) {
            const canvas = document.getElementById("offCanvas"); // Get the canvas element
            const ctx = canvas.getContext("2d"); // Get the drawing context of the canvas
            const xFac = canvas.width / window.innerWidth; // Calculate scaling factor for x-axis
            const yFac = canvas.height / window.innerHeight; // Calculate scaling factor for y-axis
            const trueOffsetX = offset * xFac; // Apply offset to x-axis
            const trueOffsetY = offset * yFac; // Apply offset to y-axis
            const h = canvas.height; // Canvas height
            const w = canvas.width; // Canvas width

            const canvasCalib = this.generatePoints(trueOffsetX, trueOffsetY, w, h, pointNum); // Generate points for calibration
            const trueCalib = this.generatePoints(offset, offset, window.innerWidth, window.innerHeight, pointNum); // Generate true calibration points
            this.updatePattern(trueCalib); // Update pattern in store

            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

            ctx.fillStyle = backgroundColor; // Set the background color
            ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the background

            ctx.fillStyle = "red"; // Set point color to red
            canvasCalib.forEach((point) => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI); // Draw each point
                ctx.fill();
                ctx.closePath();
            });
        },
        generatePoints(offsetX, offsetY, width, height, pointNum) {
            // Define possible patterns for calibration points
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
            ];
            const pattern = possiblePatterns.find(pattern => pattern.length === pointNum); // Find the pattern that matches the point count
            return pattern;
        },
    },
    watch: {
        offset(newOffset) {
            this.drawOffset(newOffset, this.pointNumber, this.backgroundColor); // Redraw canvas when offset changes
        },
        pointNumber(newPointNumber) {
            this.drawOffset(this.offset, newPointNumber, this.backgroundColor); // Redraw canvas when point number changes
        },
        backgroundColor(newBackgroundColor) {
            this.drawOffset(this.offset, this.pointNumber, newBackgroundColor); // Redraw canvas when background color changes
        },
    },
    mounted() {
        this.drawOffset(this.offset, this.pointNumber, this.backgroundColor); // Initial drawing on component mount
    },
};
</script>