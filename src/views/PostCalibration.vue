<template>
    <div>
        <canvas ref="canvas" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            xValues: [],
            yValues: [],
        };
    },
    mounted() {
        this.draw();
        setInterval(this.fillArrays, 1000);
    },
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
    methods: {
        fillArrays() {
            this.xValues.push(Math.floor(Math.random() * 900));
            this.yValues.push(Math.floor(Math.random() * 900));
            this.draw();
        },
        draw() {
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');

            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            canvas.width = screenWidth;
            canvas.height = screenHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < this.xValues.length; i++) {
                const x = this.xValues[i];
                const y = screenHeight - this.yValues[i];

                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.fill();
            }
        }
    },
}
</script>