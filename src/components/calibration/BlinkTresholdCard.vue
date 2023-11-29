<template>
    <v-container>
        <v-col>
            <v-card outlined>
                <v-card-title>
                    blink filter config:
                </v-card-title>
                <div class="custom-outline">
                    Control:
                    <v-checkbox v-model="blinkFilter" label="Blink Filter" color="black"></v-checkbox>
                </div>
                <div v-if="blinkFilter" class="custom-outline">
                    <BlinkTreshold />
                </div>

            </v-card>
        </v-col>
    </v-container>
</template>

<script>
import BlinkTreshold from './BlinkTreshold.vue'

export default {
    components: {
        BlinkTreshold,
    },
    data() {
        return {
            blinkFilter: true
        }
    },
    watch: {
        blinkFilter(value) {
            this.updateBlinkFilter(value)
        },
    },
    methods: {
        updateBlinkFilter(value) {
            this.$store.commit('setBlinkFilter', value)
        },
    },
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