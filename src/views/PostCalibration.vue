<template>
    <div class="scroll-container">
        <!-- Instructions Card -->
        <div class="instructions-overlay">
            <v-card class="instruction-card" outlined>
                <v-card-text class="pa-4">
                    <div class="d-flex align-center">
                        <v-icon color="info" class="mr-3">mdi-information-outline</v-icon>
                        <div>
                            <strong>Understanding Your Results:</strong>
                            <p class="mb-0 mt-1 text-caption">
                                <span style="color: green;">●</span> Green points = Good accuracy<br>
                                <span style="color: orange;">●</span> Orange points = Needs improvement<br>
                                <span style="color: red;">●</span> Red line = Distance from target
                            </p>
                        </div>
                    </div>
                </v-card-text>
            </v-card>
        </div>

        <canvas style="width: 100%; height: 100%;" id="canvas" />
        <div>
            <PointModal :x="Number(x)" :y="Number(y)" :precision="Number(precision)" :accuracy="Number(accuracy)"
                :dialog="dialog" :pointNumber="pointNumber" @close="dialogCancel" @select="select" />
        </div>
        <ConfigModal :configDialog="configDialog" @close="configDialogCancel" @recalib="recalibrate"
            @save="saveCalib" />
        <v-col class="pa-0">
            <DraggableFloatingButton @click="callConfigModal" :icon="'mdi-cog'" />
        </v-col>

        <div v-if="redirectingToRuxailab" class="button-overlay">
            <v-btn @click="recalibrate" color="primary">Recalibrate</v-btn>
            <v-btn @click="sendCalibToRuxailab" color="success">Send this calib to Ruxailab</v-btn>
        </div>
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
            pointNumber: 0,
            redirectingToRuxailab: false
        }
    },
    async mounted() {
        await this.verifyFromRuxailab()
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
        threshold() {
            return this.$store.state.calibration.threshold;
        },
        fromDashboard() {
            return this.$store.state.calibration.fromDashboard;
        },
        fixedTrainData() {
            return this.$store.state.predict.fixedTrainData;
        },
        predictTrainData() {
            return this.$store.state.predict.predictTrainData;
        },
        circleIrisPoints() {
            return this.$store.state.calibration.runtime.circleIrisPoints;
        },
        calibPredictionPoints() {
            return this.$store.state.calibration.runtime.calibPredictionPoints;
        },
    },
    watch: {
        mockPattern() {
            this.drawCalibPoints()
        },
        threshold() {
            this.drawCalibPoints()
        },
    },
    methods: {
        callConfigModal() {
            this.configDialog = true
        },
        async verifyFromRuxailab() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('redirectingToRuxailab')) {
                this.redirectingToRuxailab = true
            }
        },
        recalibrate() {
            this.$router.back()
        },
        async sendCalibToRuxailab() {
            const screenHeight = window.screen.height
            const screenWidth = window.screen.width

            await this.$store.dispatch('sendData', {
                fromRuxailab: true,
                circleIrisPoints: this.circleIrisPoints,
                calibPredictionPoints: this.calibPredictionPoints,
                screenHeight,
                screenWidth,
                k: this.$store.state.calibration.pointNumber,
                threshold: this.$store.state.calibration.threshold
            })
        },
        select(pointNumber) {
            this.$store.commit('setMockPatternElement', this.pattern[pointNumber])
        },
        drawCalibPoints() {
            const pointSize = 3.5
            this.initCanvas()
            for (var i = 0; i < this.pattern.length; i++) {
                // calib points
                const isSelected = this.mockPattern.includes(this.pattern[i])
                const crossColor = isSelected ? 'black' : 'grey'
                const dashColor = isSelected ? 'green' : 'red'
                const pointsColor = isSelected ? 'green' : 'orange'
                const centroidColor = isSelected ? 'rgba(0, 0, 255, 0.3)' : 'rgba(128, 128, 128, 0.3)'
                const deniedPointColor = isSelected ? 'blue' : 'grey'

                this.drawCalibMarks(this.pattern[i].x, this.pattern[i].y, 30, crossColor)
                var sumX = 0;
                var sumY = 0;
                var count = 0;
                for (var a = 0; a < this.pattern[i].predictionX.length; a++) {
                    // predicted points
                    const distance = this.euclidianDistance(this.pattern[i].x, this.pattern[i].predictionX[a], this.pattern[i].y, this.pattern[i].predictionY[a])
                    if (distance <= this.threshold) {
                        this.drawPoints(this.pattern[i].predictionX[a], this.pattern[i].predictionY[a], pointSize, pointsColor)
                        sumX += this.pattern[i].predictionX[a];
                        sumY += this.pattern[i].predictionY[a];
                        count++
                    } else {
                        this.drawPoints(this.pattern[i].predictionX[a], this.pattern[i].predictionY[a], pointSize, deniedPointColor)
                    }
                }
                var centroidX = sumX / count;
                var centroidY = sumY / count;
                this.drawDash(centroidX, centroidY, this.pattern[i].x, this.pattern[i].y, dashColor)
                this.drawCentroid(centroidX, centroidY, 1 + this.pattern[i].precision * 25.4, centroidColor)
            }
        },
        async saveCalib() {
            await this.$store.dispatch('saveCalib')
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
        euclidianDistance(x0, x1, y0, y1) {
            const dx = x1 - x0;
            const dy = y1 - y0;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance;
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
            if (this.fromDashboard) {
                const dimension = this.getLargerDistancePoint()
                const offset = 25
                canvas.width = dimension.x + offset;
                canvas.height = dimension.y + offset;
            }
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
        getLargerDistancePoint() {
            var lX = 0
            var lY = 0
            for (var i = 0; i < this.pattern.length; i++) {
                for (var a = 0; a < this.pattern[i].predictionX.length; a++) {
                    const x = this.pattern[i].predictionX[a]
                    const y = this.pattern[i].predictionY[a]
                    if (x > lX) {
                        lX = x
                    }
                    if (y > lY) {
                        lY = y
                    }
                }
            }
            return { x: lX, y: lY }
        },
        drawCentroid(x, y, radius, color) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.closePath();

            ctx.fill();
        },
        drawPoints(x, y, radius, color) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            // inner circle
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
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
        },
        drawCalibMarks(x, y, crossSize, color) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');

            ctx.strokeStyle = color;
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(x - crossSize, y);
            ctx.lineTo(x + crossSize, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y - crossSize);
            ctx.lineTo(x, y + crossSize);
            ctx.stroke();
        },
        drawDash(fromX, fromY, toX, toY, color) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = color;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.stroke();
            ctx.closePath();
            ctx.setLineDash([]);
        }
    },
};
</script>


<style>
.scroll-container {
    width: 100%;
    overflow-x: auto;
    position: relative;
}

.banner-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    line-height: 1.2;
}

.banner-subtitle {
    font-size: 14px;
    margin: 4px 0 0 0;
    opacity: 0.95;
}

.instructions-overlay {
    position: fixed;
    top: 90px;
    right: 24px;
    z-index: 999;
    max-width: 300px;
}

.button-overlay {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    display: flex;
    gap: 12px;
}

.instruction-card {
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(10px);
    border-radius: 12px;
}

.v-dialog__content {
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: unset;
    width: 300px;
}

.v-dialog {
    box-shadow: none;
    overflow-y: visible;
}
</style>