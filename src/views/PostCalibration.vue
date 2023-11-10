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
                rightX: [],
                rightY: [],
                leftX: [],
                leftY: [],
                calibX: [],
                calibY: [],
            },
            predictTrainPoints: {
                rightX: [],
                rightY: [],
                leftX: [],
                leftY: [],
            }
        };
    },
    mounted() {
        this.resizeCanvas()
        this.draw(this.fixedTrainPoints.calibX, this.fixedTrainPoints.calibY, 'black')
        this.draw(this.fixedTrainPoints.rightX, this.fixedTrainPoints.rightY, 'blue')
        this.draw(this.fixedTrainPoints.leftX, this.fixedTrainPoints.leftY, 'red')
        this.draw(this.predictTrainPoints.rightX, this.predictTrainPoints.rightY, 'green')
        this.draw(this.predictTrainPoints.leftX, this.predictTrainPoints.leftY, 'orange')



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
        this.extractXYValues(this.fixedTrainData, this.fixedTrainPoints, true);
        this.extractXYValues(this.predictTrainData, this.predictTrainPoints, false);
    },
    methods: {
        extractXYValues(extract, receiver, hasCalib) {
            for (let i = 0; i < extract.length; i++) {
                const dataPoint = extract[i];
                receiver.rightX.push(dataPoint.right_iris_x)
                receiver.rightY.push(dataPoint.right_iris_y)
                receiver.leftX.push(dataPoint.left_iris_x)
                receiver.leftY.push(dataPoint.left_iris_y)
                if (hasCalib) {
                    receiver.calibX.push(dataPoint.point_x)
                    receiver.calibY.push(dataPoint.point_y)
                }
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
