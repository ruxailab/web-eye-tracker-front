<template>
    <v-row>
        <v-col cols="8">
            <Slider :value="radius" :min="Number(20)" :max="Number(60)" label="radius" @input="updateRadius" />
        </v-col>
        <v-col cols="4" style="max-width: 100%; max-height: 100%; display: flex; align-items: stretch;">
            <canvas id="myCanvas" style="width: 100%; height: 100%;"></canvas>
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
        radius() {
            return Number(this.$store.state.calibration.radius ?? 0);
        },
    },
    methods: {
        updateRadius(value) {
            this.$store.commit('setRadius', value);
        },
    },
};
</script>