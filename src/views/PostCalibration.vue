<template>
    <div>
        <div>{{ fixedTrainData }}</div>
        <div>{{ predictTrainData }}</div>
        <div>{{ prediction }}</div>
    </div>
</template>

<script>
export default {
    computed: {
        fixedTrainData() {
            return this.$store.state.predict.fixedTrainData
        },
        predictTrainData() {
            return this.$store.state.predict.predictTrainData
        },
        prediction() {
            return this.$store.state.predict.prediction
        },
    },
    created() {
        console.log(this.$store.state.predict)
    },
}
</script>