<template>
    <v-container>
        <v-col>
            <v-card outlined>
                <v-card-title>
                    general configuration
                </v-card-title>
                <div class="custom-outline">
                    calib name:
                    <TextField :value="calibName" @input="updateCalibName" />
                </div>
                <div class="custom-outline">
                    <Slider :value="pointNumber" :min="Number(1)" :max="Number(9)" label="Point Number"
                        @input="updatePointNumber" />
                    <Slider :value="samplePerPoint" label="Sample Per Point" @input="updateSamplePerPoint" />
                </div>
                <div v-if="blinkFilter" class="custom-outline">
                    <Slider :value="leftEyeTreshold" :min="Number(3)" :max="Number(7)" :decimal="true"
                        label="left eye treshold" @input="updateLeftTreshold" />
                    <Slider :value="rightEyeTreshold" :min="Number(3)" :max="Number(7)" :decimal="true"
                        label="right eye treshold" @input="updateRightTreshold" />
                </div>
                <div class="custom-outline">
                    <Radius />
                    <Offset />
                </div>
            </v-card>
        </v-col>
    </v-container>
</template>
  
<script>
import Slider from "@/components/general/Slider.vue";
import TextField from "@/components/general/TextField.vue";
import Radius from "@/components/calibration/Radius"
import Offset from "@/components/calibration/Offset.vue";

export default {
    components: {
        Radius,
        Offset,
        Slider,
        TextField
    },
    computed: {
        samplePerPoint() {
            return Number(this.$store.state.calibration.samplePerPoint);
        },
        pointNumber() {
            return Number(this.$store.state.calibration.pointNumber);
        },
        calibName() {
            return this.$store.state.calibration.calibName
        },
        blinkFilter() {
            return this.$store.state.calibration.blinkFilter
        },
        leftEyeTreshold() {
            return Number(this.$store.state.calibration.leftEyeTreshold)
        },
        rightEyeTreshold() {
            return Number(this.$store.state.calibration.rightEyeTreshold)
        },
    },
    methods: {
        updateSamplePerPoint(value) {
            this.$store.commit('setSamplePerPoint', value);
        },
        updatePointNumber(value) {
            this.$store.commit('setPointNumber', value);
        },
        updateCalibName(value) {
            const trimmedValue = value.replace(/\s+/g, '');

            if (trimmedValue !== '') {
                this.$store.commit('setCalibName', trimmedValue);
            } else {
                console.log('Value contains only white spaces or is empty');
            }
        },
        updateLeftTreshold(value) {
            this.$store.commit('setLeftTreshold', value);
        },
        updateRightTreshold(value) {
            this.$store.commit('setRightTreshold', value);
        },
    },
};
</script>

<style scoped>
.custom-outline {
    border: 1px solid #000;
    padding: 10px;
    border-radius: 5px;
    margin: 10px;
}
</style>