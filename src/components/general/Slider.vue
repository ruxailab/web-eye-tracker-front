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
    // Props define the parameters that are passed to the component
    props: {
        // 'step' defines the step size for the slider, default is 1
        step: {
            type: Number,
            default: 1,
        },
        // 'value' is the current value of the slider, default is 0
        value: {
            type: Number,
            default: 0,
        },
        // 'min' defines the minimum value of the slider, default is 5
        min: {
            type: Number,
            default: 5,
        },
        // 'max' defines the maximum value of the slider, default is 100
        max: {
            type: Number,
            default: 100,
        },
        // 'label' is a string for the label text, can be passed as a prop
        label: String,
    },
    // Data function returns the internal state for slider value
    data() {
        return {
            sliderValue: this.value, // Initialize slider value with the 'value' prop
        };
    },
    // Watchers allow to react to changes in props or data
    watch: {
        // When the 'value' prop changes, update 'sliderValue'
        value(newVal) {
            this.sliderValue = newVal;
        },
        // When 'sliderValue' changes, emit the new value to the parent component
        sliderValue(newVal) {
            this.$emit('input', newVal);
        },
    },
    // Methods define functions for handling events
    methods: {
        // 'updateValue' emits the current slider value to the parent component
        updateValue() {
            this.$emit('input', this.sliderValue);
        },
    },
};
</script>