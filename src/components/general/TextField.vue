<template>
    <div>
        <input type="text" v-model="inputValue" />
    </div>
</template>
  
<script>
export default {
    props: {
        // 'value' is the initial value for the input, default is an empty string
        value: {
            type: String,
            default: '',
        },
    },
    // Data function returns the internal state for the input value
    data() {
        return {
            // 'inputValue' holds the current value of the input field
            inputValue: this.value, // Initialize input value with the 'value' prop
        };
    },
    watch: {
        // When the 'value' prop changes, update 'inputValue' with the new value
        value(newVal) {
            this.inputValue = newVal;
        },
        // When 'inputValue' changes, emit the new value to the parent component
        inputValue(newVal) {
            this.$emit('input', newVal);
        },
    },
    methods: {
        // 'updateInput' emits the current input value to the parent component
        updateInput() {
            this.$emit('input', this.inputValue);
        },
    },
};
</script>
  
<style scoped>
label {
    font-weight: bold;
    margin-bottom: 5px;
}

input {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 200px;
}
</style>
  