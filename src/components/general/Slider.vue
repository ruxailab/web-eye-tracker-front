<template>
    <v-container>
        <v-row>
            <v-col>
                {{ label }} : {{ sliderValue }}
                <v-slider v-model="sliderValue" :min="min" :max="max" :step="step"
                    class="my-slider"></v-slider>
            </v-col>
        </v-row>
    </v-container>
</template>
  
<script>
export default {
    props: {
        step: {
            type: Number,
            default: 1,
        },
        value: {
            type: Number,
            default: 0,
        },
        min: {
            type: Number,
            default: 5,
        },
        max: {
            type: Number,
            default: 100,
        },
        label: String,
    },
    data() {
        return {
            sliderValue: this.value,
        };
    },
    watch: {
        value(newVal) {
            this.sliderValue = newVal;
        },
        sliderValue(newVal) {
            this.$emit('input', newVal);
        },
    },
    methods: {
        updateValue() {
            this.$emit('input', this.sliderValue);
        },
    },
};
</script>