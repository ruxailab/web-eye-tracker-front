<template>
    <div>
        <label>{{ label }}</label>
        <input type="range" min="5" max="100" step="1" v-model="sliderValue" @input="updateValue" />
        <span>{{ sliderValue }}</span>
    </div>
</template>
  
<script>
export default {
    props: {
        value: {
            type: Number,
            default: 0,
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