<template>
    <div>
        {{ label }} : 
        <input type="text" v-model="inputValue" />
    </div>
</template>
  
<script>
export default {
    props: {
        value: {
            type: String,
            default: '',
        },
        label: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            inputValue: this.value,
        };
    },
    watch: {
        value(newVal) {
            this.inputValue = newVal;
        },
        inputValue(newVal) {
            this.$emit('input', newVal);
        },
    },
    methods: {
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
  