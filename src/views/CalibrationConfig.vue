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
                        <Slider :value="offset" :min="Number(50)" :max="Number(100)" label="offset" @input="updateOffset" />
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

export default {
    components: {
        Toolbar,
        Radius,
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

<style scoped>
.custom-outline {
    border: 1px solid #000;
    padding: 10px;
    border-radius: 5px;
    margin: 10px;
}
</style>