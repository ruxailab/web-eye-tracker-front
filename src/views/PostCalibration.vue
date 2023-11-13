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
            model: null,
        };
    },
    async mounted() {
        this.resizeCanvas()
        this.draw(this.fixedTrainData.calibX, this.fixedTrainData.calibY, 'black')
        await this.trainModel()
        await this.predictCalibrationValues()
        // this.draw(this.fixedTrainData.rightX, this.fixedTrainData.rightY, 'blue')
        // this.draw(this.fixedTrainData.leftX, this.fixedTrainData.leftY, 'red')
        // this.draw(this.predictTrainData.rightX, this.predictTrainData.rightY, 'green')
        // this.draw(this.predictTrainData.leftX, this.predictTrainData.leftY, 'orange')
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
    methods: {
        async trainModel() {
            const rightX = tf.tensor2d(this.fixedTrainData.rightX, [this.fixedTrainData.rightX.length, 1]);
            const rightY = tf.tensor2d(this.fixedTrainData.rightY, [this.fixedTrainData.rightY.length, 1]);
            const leftX = tf.tensor2d(this.fixedTrainData.leftX, [this.fixedTrainData.leftX.length, 1]);
            const leftY = tf.tensor2d(this.fixedTrainData.leftY, [this.fixedTrainData.leftY.length, 1]);

            const xs = tf.concat([rightX, rightY, leftX, leftY], 1);

            const calibX = tf.tensor2d(this.fixedTrainData.calibX, [this.fixedTrainData.calibX.length, 1]);
            const calibY = tf.tensor2d(this.fixedTrainData.calibY, [this.fixedTrainData.calibY.length, 1]);

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

            const rightX = tf.tensor2d(this.predictTrainData.rightX, [this.predictTrainData.rightX.length, 1]);
            const rightY = tf.tensor2d(this.predictTrainData.rightY, [this.predictTrainData.rightY.length, 1]);
            const leftX = tf.tensor2d(this.predictTrainData.leftX, [this.predictTrainData.leftX.length, 1]);
            const leftY = tf.tensor2d(this.predictTrainData.leftY, [this.predictTrainData.leftY.length, 1]);

            const inputTensors = tf.concat([rightX, rightY, leftX, leftY], 1);

            const predictions = this.model.predict(inputTensors).dataSync();

            const calibXPredictions = predictions.slice(0, this.predictTrainData.rightX.length);
            const calibYPredictions = predictions.slice(this.predictTrainData.rightX.length);

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
