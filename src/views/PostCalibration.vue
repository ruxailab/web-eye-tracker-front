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
    },
    computed: {
        fixedTrainData() {
            return this.$store.state.predict.fixedTrainData;
        },
        predictTrainData() {
            return this.$store.state.predict.predictTrainData;
        },
        prediction() {
            return this.$store.state.predict.prediction;
        },
    },
    created() {
        this.extractXYValues();
    },
    methods: {
        extractXYValues() {
            for (let i = 0; i < this.predictTrainData.length; i++) {
                const predictDataPoint = this.predictTrainData[i];
                const fixedTrainPoint = this.fixedTrainData[i];

                this.xValues.push(predictDataPoint.left_iris_x, predictDataPoint.right_iris_x);
                this.xValues.push(fixedTrainPoint.left_iris_x, fixedTrainPoint.right_iris_x)
                this.yValues.push(predictDataPoint.left_iris_y, predictDataPoint.right_iris_y);
                this.yValues.push(fixedTrainPoint.left_iris_y, fixedTrainPoint.right_iris_y)
            }
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
        },
    },
};
</script>
