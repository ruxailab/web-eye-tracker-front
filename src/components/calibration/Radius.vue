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
    // Registering the Slider component for use in this component
    components: {
        Slider,
    },
    // Computed properties derive values from the Vuex store
    computed: {
        // 'radius' gets the radius value from the Vuex store, defaulting to 0 if not found
        radius() {
            return Number(this.$store.state.calibration.radius ?? 0);
        },
        // 'pointColor' gets the point color value from the Vuex store
        pointColor() {
            return this.$store.state.calibration.pointColor
        },
    },
    // Methods define functions that manipulate data or perform actions
    methods: {
        // 'updateRadius' commits the new radius value to the Vuex store
        updateRadius(value) {
            this.$store.commit('setRadius', value);
        },
        // 'drawBall' draws two concentric circles on the canvas
        // The outer circle's radius is 'radius * 2' and the inner circle's radius is '(radius / 3) * 2'
        drawBall(radius, pointColor) {
            const canvas = document.getElementById("radCanvas");
            const ctx = canvas.getContext("2d");
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            // Clear the canvas before drawing
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw the outer circle (ball) with the specified radius and color
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 2, 0, 2 * Math.PI);
            ctx.fillStyle = pointColor;
            ctx.fill();
            ctx.closePath();
            // Draw the inner circle (red dot)
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius / 3) * 2, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.closePath();
        },
    },
    // Watchers track changes in specific properties and react to them
    watch: {
        // When the 'radius' changes, redraw the ball with the updated radius and color
        radius(newRadius) {
            this.drawBall(newRadius, this.pointColor);
        },
        // When the 'pointColor' changes, redraw the ball with the updated color and radius
        pointColor(newPointColor) {
            this.drawBall(this.radius, newPointColor);
        },
    },
    // Mounted lifecycle hook triggers when the component is mounted
    mounted() {
        // Initially draw the ball with the current radius and color
        this.drawBall(this.radius)
    },
};
</script>