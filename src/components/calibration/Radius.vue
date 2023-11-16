<template>
    <v-row class="d-flex align-center">
        <v-col cols="10">
            <Slider :value="radius" :min="Number(10)" :max="Number(35)" label="radius" @input="updateRadius" />
        </v-col>
        <v-col cols="2" style="max-width: 100%; max-height: 100%; display: flex; align-items: stretch;">
            <canvas id="radCanvas" style="width: 100%; height: 100%;"></canvas>
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
        radius() {
            return Number(this.$store.state.calibration.radius ?? 0);
        },
    },
    methods: {
        updateRadius(value) {
            this.$store.commit('setRadius', value);
        },
        drawBall(radius) {
            const canvas = document.getElementById("radCanvas");
            const ctx = canvas.getContext("2d");
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 2, 0, 2 * Math.PI);
            ctx.fillStyle = "black";
            ctx.fill();
            ctx.closePath();
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius / 3) * 2, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath();
        },
    },
    watch: {
        radius(newRadius) {
            this.drawBall(newRadius);
        },
    },
    mounted() {
        this.drawBall(this.radius)
    },
};
</script>