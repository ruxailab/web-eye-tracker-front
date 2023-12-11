<template>
    <div>
        <canvas id="canvas" />
        <div>
            <PointModal :x="Number(x)" :y="Number(y)" :precision="Number(precision)" :accuracy="Number(accuracy)"
                :dialog="dialog" :pointNumber="pointNumber" @close="dialogCancel" @select="select" />
        </div>
        <div>
            <ConfigModal :configDialog="configDialog" @close="configDialogCancel" @recalib="recalibrate"
                @goBack="goToDashboard" />
        </div>
        <v-col>
            <DraggableFloatingButton @click="callConfigModal" :icon="'mdi-cog'" />
        </v-col>
    </div>
</template>

<script>
import PointModal from '@/components/calibration/PointModal.vue';
import DraggableFloatingButton from '@/components/general/DraggableFloatingButton.vue';
import ConfigModal from '@/components/calibration/ConfigModal.vue';

export default {
    components: {
        PointModal,
        DraggableFloatingButton,
        ConfigModal
    },
    data() {
        return {
            innerCircleRadius: 5,
            x: 0,
            y: 0,
            precision: 0,
            accuracy: 0,
            dialog: false,
            configDialog: false,
            pointNumber: 0
        }
    },
    async mounted() {
        this.initCanvas()
        this.drawCalibPoints()
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
    watch: {
        mockPattern() {
            this.drawCalibPoints()
        }
    },
    methods: {
        callConfigModal() {
            this.configDialog = true
        },
        select(pointNumber) {
            this.$store.commit('setMockPatternElement', this.pattern[pointNumber])
        },
        drawCalibPoints() {
            this.initCanvas()
            for (var i = 0; i < this.pattern.length; i++) {
                // calib points
                const isSelected = this.mockPattern.includes(this.pattern[i])
                this.drawPoints(this.pattern[i].x, this.pattern[i].y, this.radius * this.pattern[i].accuracy, this.innerCircleRadius, true, isSelected)


                for (var a = 0; a < this.pattern[i].predictionX.length; a++) {
                    // predicted points
                    this.drawPoints(this.pattern[i].predictionX[a], this.pattern[i].predictionY[a], 0, 2, false)
                }
            }
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
        configDialogCancel(newDialog) {
            this.configDialog = newDialog
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
        drawPoints(x, y, radius, innerRadius, hasCircumference, isSelected) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            //circle
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

            ctx.arc(
                x,
                y,
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
                x,
                y,
                innerRadius,
                0,
                Math.PI * 2,
                false
            );
            ctx.stroke();
            ctx.fill();
            // hollow circumference
            if (hasCircumference) {
                const color = isSelected ? 'blue' : this.pointColor
                ctx.strokeStyle = color;
                ctx.fillStyle = color;

                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(x, y, this.radius, 0, 2 * Math.PI, false);
                ctx.stroke();
            }
        },
    },
};
</script>
