<template>
    <div>
        <Toolbar />
        <div>
            <Slider :value="samplePerPoint" label="Sample Per Point" @input="updateSamplePerPoint" />
        </div>
        <div>
            <Slider :value="radius" label="radius" @input="updateRadius" />
        </div>
        <div>
            <Slider :value="offset" label="offset" @input="updateOffset" />
        </div>
    </div>
</template>
  
<script>
import Toolbar from "@/components/Toolbar.vue";
import Slider from "@/components/Slider.vue";

export default {
    components: {
        Toolbar,
        Slider,
    },
    computed: {
        samplePerPoint() {
            return Number(this.$store.state.calibration.samplePerPoint ?? 0);
        },
        radius() {
            return Number(this.$store.state.calibration.radius ?? 0);
        },
        offset() {
            return Number(this.$store.state.calibration.offset ?? 0);
        },
    },
    methods: {
        updateSamplePerPoint(value) {
            this.$store.commit('setSamplePerPoint', value);
        },
        updateRadius(value) {
            this.$store.commit('setRadius', value);
        },
        updateOffset(value) {
            this.$store.commit('setOffset', value);
        },
    },
};
</script>