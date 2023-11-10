<template>
    <div>
        <canvas ref="canvas" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            fixedTrainPoints: {
                x: [],
                y: [],
            },
            predictTrainPoints: {
                x: [],
                y: [],
            }
        };
    },
    mounted() {
        this.resizeCanvas()
        this.draw(this.fixedTrainPoints.x, this.fixedTrainPoints.y, 'blue');
        this.draw(this.predictTrainPoints.x, this.predictTrainPoints.y, 'red');
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
        this.extractXYValues(this.fixedTrainData, this.fixedTrainPoints);
        this.extractXYValues(this.predictTrainData, this.predictTrainPoints);
    },
    methods: {
        extractXYValues(extract, receiver) {
            for (let i = 0; i < extract.length; i++) {
                const dataPoint = extract[i];

                receiver.x.push(dataPoint.left_iris_x, dataPoint.right_iris_x)
                receiver.y.push(dataPoint.left_iris_y, dataPoint.right_iris_y)
            }
        },
        resizeCanvas() {
            const canvas = this.$refs.canvas;
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            canvas.width = screenWidth;
            canvas.height = screenHeight;
        },

        draw(arrX, arrY, color) {
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');

            for (let i = 0; i < arrX.length; i++) {
                const x = arrX[i];
                const y = arrY[i];

                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = `${color}`;
                ctx.fill();
            }
        },
    },
};
</script>
