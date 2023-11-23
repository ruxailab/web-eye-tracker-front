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
                </div>
                <div class="custom-outline">
                    <Slider :value="samplePerPoint" label="Sample Per Point" @input="updateSamplePerPoint" />
                </div>
                <div class="custom-outline">
                    <Radius />
                </div>
                <div class="custom-outline">
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
            return Number(this.$store.state.calibration.samplePerPoint ?? 0);
        },
        pointNumber() {
            return Number(this.$store.state.calibration.pointNumber ?? 0);
        },
        calibName() {
            return this.$store.state.calibration.calibName
        }
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
        }
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