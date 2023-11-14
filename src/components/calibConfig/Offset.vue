<template>
    <v-row class="d-flex align-center">
        <v-col cols="10">
            <Slider :value="offset" :min="Number(50)" :max="Number(100)" label="radius" @input="updateOffset" />
        </v-col>
        <v-col cols="2" style="max-width: 100%; max-height: 100%; display: flex; align-items: stretch;">
            <canvas id="offCanvas" style="width: 100%; height: 100%;"></canvas>
        </v-col>
    </v-row>
</template>
  
<script>
import Slider from "@/components/Slider.vue";

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
            const points = [];
            for (let i = 0; i < pointNum; i++) {
                const angle = (i / pointNum) * 2 * Math.PI;
                const x = canvasWidth / 2 + Math.cos(angle) * offset;
                const y = canvasHeight / 2 + Math.sin(angle) * offset;
                points.push({ x, y });
            }
            return points;
        },
    },
    watch: {
        offset(newOffset) {
            this.drawOffset(newOffset, this.pointNumber);
        },
        pointNumber(newPointNumber){
            this.drawOffset(this.offset, newPointNumber);
        }
    },
    mounted() {
        this.drawOffset(this.offset, this.pointNumber)
    },
};
</script>