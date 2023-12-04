<template>
    <div>
        <canvas id="canvas" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            innerCircleRadius: 5,
        }
    },
    async mounted() {
        const calibPointsx = []
        const calibPointsy = []
        this.pattern.forEach(element => {
            calibPointsx.push(element.x)
            calibPointsy.push(element.y)
        });
        this.drawPoints(calibPointsx, calibPointsy, 1)
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
        drawPoints(x, y, radius) {
            const canvas = document.getElementById('canvas');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            //circle 
            for (var i = 0; i < x.length; i++) {
                ctx.beginPath();
                ctx.strokeStyle = this.pointColor;
                ctx.fillStyle = this.pointColor;
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
            }
        },
    },
};
</script>
