<template>
    <v-container>
        <v-col>
            <v-card outlined>
                <v-card-title>
                    miscelaneous configuration
                </v-card-title>
                <div class="custom-outline">
                    <v-color-picker v-model="backgroundColor"></v-color-picker>
                </div>
                <div class="custom-outline">
                    <v-color-picker v-model="pointColor"></v-color-picker>
                </div>
            </v-card>
        </v-col>
    </v-container>
</template>
  
<script>
export default {
    // computed: {
    //     backgroundColor() {
    //         return this.$store.state.calibration.backgroundColor;
    //     },
    //     pointColor() {
    //         return this.$store.state.calibration.pointColor;
    //     },
    // },
    data() {
        return {
            backgroundColor: '#FFFFFFFF',
            pointColor: '#000000FF',
        }
    },
    watch: {
        backgroundColor(value) {
            this.updateBackgroundColor(value)
        },
        pointColor(value) {
            this.updatePointColor(value)
        },
    },
    methods: {
        updateBackgroundColor(value) {
            this.$store.commit('setBackgroundColor', value);
        },
        updatePointColor(value) {
            this.$store.commit('setPointColor', value);
        },
    }
}
</script>

<style scoped>
.custom-outline {
    border: 1px solid #000;
    padding: 10px;
    border-radius: 5px;
    margin: 10px;
}
</style>