<template>
    <div>
        <canvas id="canvas" />
        <div>
            <PointModal :x="x" :y="y" :precision="precision" :dialog="dialog" :pointNumber="pointNumber"
                @dialogCancel="dialogCancel" />
        </div>
        <DraggableFloatingButton @click="goToDashboard" />
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
            dialog: false,
            pointNumber: 0
        }
    },
    async mounted() {
        const calibPointsX = []
        const calibPointsY = []
        const precisions = []
        this.pattern.forEach(element => {
            element.precision = (Math.random()).toFixed(2)
            calibPointsX.push(element.x)
            calibPointsY.push(element.y)
            precisions.push(element.precision)
        });
        this.drawPoints(calibPointsX, calibPointsY, precisions)
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
        fixedTrainData() {
            return this.$store.state.predict.fixedTrainData;
        },
        predictTrainData() {
            return this.$store.state.predict.predictTrainData;
        },
    },
    methods: {
        goToDashboard() {
            console.log('emited click')
        },
        callModal(patternLike, pointNumber) {
            console.log(patternLike);
            this.x = patternLike.x
            this.y = patternLike.y
            this.precision = patternLike.precision
            this.dialog = true
            this.pointNumber = pointNumber + 1
        },
        dialogCancel(newDialog) {
            this.dialog = newDialog
        },
        drawPoints(x, y, precisions) {
            const canvas = document.getElementById('canvas');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            const points = [];
            //circle 
            for (var i = 0; i < x.length; i++) {
                ctx.beginPath();
                ctx.strokeStyle = 'black';
                ctx.fillStyle = 'black';

                ctx.arc(
                    x[i],
                    y[i],
                    this.radius * precisions[i],
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
            const th = this;
            canvas.addEventListener('click', function (event) {
                const rect = canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                for (let i = 0; i < points.length; i++) {
                    const point = points[i];
                    const distanceFromCenter = Math.sqrt(
                        Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
                    );

                    if (distanceFromCenter <= point.radius) {
                        const patternEquivalent = th.pattern[i]
                        th.callModal(patternEquivalent, i)
                    }
                }
            });
        },
    },
};
</script>
