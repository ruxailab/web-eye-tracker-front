<template>
    <v-container>
        <v-col>
            <v-card outlined>
                <v-card-title>
                    miscelaneous configuration
                </v-card-title>
                <div class="custom-outline">
                    Control:
                    <v-checkbox v-model="customColors" label="Use Custom Colors" color="black"></v-checkbox>
                </div>
                <div v-if="customColors">
                    <div class="custom-outline">
                        Background Color:
                        <v-color-picker v-model="backgroundColor" hide-inputs></v-color-picker>
                    </div>
                    <div class="custom-outline">
                        Point Color:
                        <v-color-picker v-model="pointColor" hide-inputs></v-color-picker>
                    </div>
                </div>
            </v-card>
        </v-col>
    </v-container>
</template>
  
<script>
export default {
    data() {
        return {
            backgroundColor: '#FFFFFFFF',
            pointColor: '#000000FF',
            customColors: false,
        }
    },
    watch: {
        backgroundColor(value) {
            this.updateBackgroundColor(value)
        },
        pointColor(value) {
            this.updatePointColor(value)
        },
        customColors(value) {
            this.updateCustomColors(value)
        },
    },
    methods: {
        updateBackgroundColor(value) {
            this.$store.commit('setBackgroundColor', value);
        },
        updatePointColor(value) {
            this.$store.commit('setPointColor', value);
        },
        updateCustomColors(value) {
            this.$store.commit('setCustomColors', value);
        }
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