<template>
    <div>
        <canvas ref="canvas" />
    </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs';
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
            },
            model: null,
        };
    },
    async mounted() {
        this.resizeCanvas()
        this.draw(this.fixedTrainPoints.calibX, this.fixedTrainPoints.calibY, 'black')
        await this.trainModel()
        await this.predictCalibrationValues()
        // this.draw(this.fixedTrainPoints.rightX, this.fixedTrainPoints.rightY, 'blue')
        // this.draw(this.fixedTrainPoints.leftX, this.fixedTrainPoints.leftY, 'red')
        // this.draw(this.predictTrainPoints.rightX, this.predictTrainPoints.rightY, 'green')
        // this.draw(this.predictTrainPoints.leftX, this.predictTrainPoints.leftY, 'orange')
    },
    computed: {
        fixedTrainData() {
            return this.$store.state.predict.fixedTrainData;
        },
        predictTrainData() {
            return this.$store.state.predict.predictTrainData;
        },
        predictionResults() {
            return this.makePredictions();
        },
    },
    created() {
        this.extractXYValues(this.fixedTrainData, this.fixedTrainPoints, true);
        this.extractXYValues(this.predictTrainData, this.predictTrainPoints, false);
    },
    methods: {
        async trainModel() {
            const rightX = tf.tensor2d(this.fixedTrainPoints.rightX, [this.fixedTrainPoints.rightX.length, 1]);
            const rightY = tf.tensor2d(this.fixedTrainPoints.rightY, [this.fixedTrainPoints.rightY.length, 1]);
            const leftX = tf.tensor2d(this.fixedTrainPoints.leftX, [this.fixedTrainPoints.leftX.length, 1]);
            const leftY = tf.tensor2d(this.fixedTrainPoints.leftY, [this.fixedTrainPoints.leftY.length, 1]);

            const xs = tf.concat([rightX, rightY, leftX, leftY], 1);

            const calibX = tf.tensor2d(this.fixedTrainPoints.calibX, [this.fixedTrainPoints.calibX.length, 1]);
            const calibY = tf.tensor2d(this.fixedTrainPoints.calibY, [this.fixedTrainPoints.calibY.length, 1]);

            const ys = tf.concat([calibX, calibY], 1);

            console.log('Input shapes:');
            console.log('rightX:', rightX.shape);
            console.log('rightY:', rightY.shape);
            console.log('leftX:', leftX.shape);
            console.log('leftY:', leftY.shape);
            console.log('Input tensor shape:', xs.shape);

            console.log('Target shapes:');
            console.log('calibX:', calibX.shape);
            console.log('calibY:', calibY.shape);
            console.log('Target tensor shape:', ys.shape);

            this.model = tf.sequential();
            this.model.add(tf.layers.dense({ units: 2, inputShape: [4] }));

            this.model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

            await this.model.fit(xs, ys);

            xs.dispose();
            ys.dispose();
        },
        predictCalibrationValues() {
            if (!this.model) {
                console.error('Model not trained. Please train the model first.');
                return;
            }

            const rightX = tf.tensor2d(this.predictTrainPoints.rightX, [this.predictTrainPoints.rightX.length, 1]);
            const rightY = tf.tensor2d(this.predictTrainPoints.rightY, [this.predictTrainPoints.rightY.length, 1]);
            const leftX = tf.tensor2d(this.predictTrainPoints.leftX, [this.predictTrainPoints.leftX.length, 1]);
            const leftY = tf.tensor2d(this.predictTrainPoints.leftY, [this.predictTrainPoints.leftY.length, 1]);

            const inputTensors = tf.concat([rightX, rightY, leftX, leftY], 1);

            const predictions = this.model.predict(inputTensors).dataSync();

            const calibXPredictions = predictions.slice(0, this.predictTrainPoints.rightX.length);
            const calibYPredictions = predictions.slice(this.predictTrainPoints.rightX.length);

            rightX.dispose();
            rightY.dispose();
            leftX.dispose();
            leftY.dispose();
            inputTensors.dispose();
            console.log(calibXPredictions)
            console.log(calibYPredictions);

            return { calibXPredictions, calibYPredictions };
        },

        async makePredictions() {
            if (!this.model) {
                console.error('Model not trained. Please train the model first.');
                return;
            }

            const { calibXPredictions, calibYPredictions } = this.predictCalibrationValues();

            console.log('Calibration X Predictions:', calibXPredictions);
            console.log('Calibration Y Predictions:', calibYPredictions);
        },
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
