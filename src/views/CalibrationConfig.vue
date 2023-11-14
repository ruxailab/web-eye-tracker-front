<template>
    <div>
        <Toolbar />
        <v-container>
            <v-col>
                <v-card outlined>
                    <v-card-title>
                        numeric calibration
                    </v-card-title>
                    <div class="custom-outline">
                        <Slider :value="samplePerPoint" label="Sample Per Point" @input="updateSamplePerPoint" />
                    </div>
                    <div class="custom-outline">
                        <Radius />
                    </div>
                    <div class="custom-outline">
                        <Offset />
                    </div>
                    <div class="custom-outline">
                        <Slider :value="pointNumber" :min="Number(1)" :max="Number(10)" label="Point Number" @input="updatePointNumber" />
                    </div>
                </v-card>
            </v-col>
        </v-container>
    </div>
</template>
  
<script>
import Toolbar from "@/components/Toolbar.vue";
import Slider from "@/components/Slider.vue";
import Radius from "@/components/calibConfig/Radius"
import Offset from "@/components/calibConfig/Offset.vue";

export default {
    components: {
        Toolbar,
        Radius,
        Offset,
        Slider,
    },
    computed: {
        samplePerPoint() {
            return Number(this.$store.state.calibration.samplePerPoint ?? 0);
        },
        pointNumber() {
            return Number(this.$store.state.calibration.pointNumber ?? 0);
        }
    },
    methods: {
        updateSamplePerPoint(value) {
            this.$store.commit('setSamplePerPoint', value);
        },
        updatePointNumber(value) {
            this.$store.commit('setPointNumber', value);
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