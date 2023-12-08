<template>
    <div>
        <canvas id="canvas" />
        <div>
            <PointModal :x="Number(x)" :y="Number(y)" :precision="Number(precision)" :accuracy="Number(accuracy)"
                :dialog="dialog" :pointNumber="pointNumber" @close="dialogCancel" @select="select" />
        </div>
        <v-col>
            <DraggableFloatingButton @click="goToDashboard" :icon="'mdi-arrow-left'" />
            <DraggableFloatingButton @click="recalibrate" :icon="'mdi-refresh'" />
        </v-col>
    </div>
</template>

<script>
import PointModal from '@/components/calibration/PointModal.vue';
import DraggableFloatingButton from '@/components/general/DraggableFloatingButton.vue';

export default {
    components: {
        PointModal,
        DraggableFloatingButton
    },
    data() {
        return {
            innerCircleRadius: 5,
            x: 0,
            y: 0,
            precision: 0,
            accuracy: 0,
            dialog: false,
            pointNumber: 0
        }
    },
    async mounted() {
        this.initCanvas()
        const calibPointsX = []
        const calibPointsY = []
        const accuracies = []
        const x = []
        const y = []
        this.pattern.forEach(element => {
            calibPointsX.push(element.x)
            calibPointsY.push(element.y)
            accuracies.push(element.accuracy)
            for (var a = 0; a < element.predictionX.length; a++) {
                x.push(element.predictionX[a])
                y.push(element.predictionY[a])
            }
        });
        // console.log(x);
        // console.log(y);
        this.drawPoints(calibPointsX, calibPointsY, accuracies)
    },
    computed: {
        radius() {
            return this.$store.state.calibration.radius
        },
        backgroundColor() {
            return this.$store.state.calibration.backgroundColor
        },
        pointColor() {
            return this.$store.state.calibration.pointColor
        },
        pattern() {
            return this.$store.state.calibration.pattern;
        },
        mockPattern() {
            return this.$store.state.calibration.mockPattern;
        },
        fixedTrainData() {
            return this.$store.state.predict.fixedTrainData;
        },
        predictTrainData() {
            return this.$store.state.predict.predictTrainData;
        },
    },
    methods: {
        select(pointNumber) {
            this.$store.commit('setMockPatternElement', this.pattern[pointNumber])
        },
        recalibrate() {
            this.$router.push('/calibration/record')
        },
        goToDashboard() {
            this.$router.push('/dashboard')
        },
        callModal(patternLike, pointNumber) {
            this.x = patternLike.x
            this.y = patternLike.y
            this.precision = patternLike.precision
            this.accuracy = patternLike.accuracy
            this.dialog = true
            this.pointNumber = pointNumber
        },
        dialogCancel(newDialog) {
            this.dialog = newDialog
        },
        initCanvas() {
            const canvas = document.getElementById('canvas');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const th = this;
            canvas.addEventListener('click', function (event) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                for (let i = 0; i < th.pattern.length; i++) {
                    const point = th.pattern[i];
                    const distanceFromCenter = Math.sqrt(
                        Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
                    );
                    
                    if (distanceFromCenter <= th.radius) {
                        const patternEquivalent = th.pattern[i]
                        th.callModal(patternEquivalent, i)
                    }
                }
            });
        },
        drawPoints(x, y, radius) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            const points = [];
            //circle 
            for (var i = 0; i < x.length; i++) {
                ctx.beginPath();
                ctx.strokeStyle = 'black';
                ctx.fillStyle = 'black';

                ctx.arc(
                    x[i],
                    y[i],
                    radius,
                    0,
                    Math.PI * 2,
                    false
                );
                ctx.stroke();
                ctx.fill();
                // inner circle
                ctx.beginPath();
                ctx.strokeStyle = "red";
                ctx.fillStyle = "red";
                ctx.arc(
                    x[i],
                    y[i],
                    this.innerCircleRadius,
                    0,
                    Math.PI * 2,
                    false
                );
                ctx.stroke();
                ctx.fill();
                // hollow circumference
                ctx.strokeStyle = this.pointColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x[i], y[i], this.radius, 0, 2 * Math.PI, false);
                ctx.stroke();
                points.push({ x: x[i], y: y[i], radius: this.radius });
            }
        },
    },
};
</script>
