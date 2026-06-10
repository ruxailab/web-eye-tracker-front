<template>
    <v-container>
        <v-col>
            <v-card outlined>
                <v-card-title>
                    General Configuration
                </v-card-title>
                <div class="custom-outline">
                    <div class="config-label">Calibration Name:</div>
                    <TextField :value="calibName" @input="updateCalibName" />
                    <p class="help-text">Give your calibration a unique identifier</p>
                </div>
                <div class="custom-outline">
                    <Slider :value="pointNumber" :min="Number(7)" :max="Number(9)" label="Calibration Points"
                        @input="updatePointNumber" />
                    <p class="help-text">Number of points to calibrate (7-9 points recommended)</p>
                    
                    <Slider :value="samplePerPoint" :min="Number(100)" :max="Number(150)" label="Samples Per Point" @input="updateSamplePerPoint" />
                    <p class="help-text">More samples = better accuracy but longer calibration</p>
                    
                    <Slider :value="msPerCapture" :min="Number(100)" :step="5" :max="Number(100)"
                        label="Milliseconds Per Capture" @input="updateMsPerCapture" />
                    <p class="help-text">Time between each eye position capture</p>
                    
                    <Slider :value="threshold" :min="Number(0)" :step="5" :max="Number(1000)"
                        label="Distance Threshold (px)" @input="updateThreshold" />
                    <p class="help-text">Maximum allowed distance for valid predictions</p>
                </div>
                <div class="custom-outline">
                    <Radius />
                    <Offset />
                </div>
               <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" @click="resetAllValues">Reset All</v-btn>
                </v-card-actions>
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
        TextField,
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
        msPerCapture() {
            return this.$store.state.calibration.msPerCapture
        },
        threshold() {
            return this.$store.state.calibration.threshold
        },
    },
    methods: {
        updateThreshold(value) {
            this.$store.commit('setThreshold', value);
        },
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
        updateMsPerCapture(value) {
            this.$store.commit('setMsPerCapture', value);
        },
        resetAllValues() {
            this.$store.commit('resetAll');
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

.config-label {
    font-weight: 600;
    font-size: 15px;
    color: #2c3e50;
    margin-bottom: 8px;
}

.help-text {
    font-size: 12px;
    color: #666;
    margin: -8px 0 8px 0;
    font-style: italic;
}
</style>