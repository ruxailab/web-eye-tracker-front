<template>
    <div>
        <Slider :value="leftEyeTreshold" :min="Number(3)" :max="Number(10)" :step="0.1" label="left eye treshold"
            @input="updateLeftTreshold" />
        <Slider :value="rightEyeTreshold" :min="Number(3)" :max="Number(10)" :step="0.1" label="right eye treshold"
            @input="updateRightTreshold" />
    </div>
</template>

<script>
import Slider from "@/components/general/Slider.vue";

export default {
    components: {
        Slider,
    },
    computed: {
        leftEyeTreshold() {
            return Number(this.$store.state.calibration.leftEyeTreshold)
        },
        rightEyeTreshold() {
            return Number(this.$store.state.calibration.rightEyeTreshold)
        },
    },
    methods: {
        updateLeftTreshold(value) {
            this.$store.commit('setLeftTreshold', value);
        },
        updateRightTreshold(value) {
            this.$store.commit('setRightTreshold', value);
        },
    },
}
</script>