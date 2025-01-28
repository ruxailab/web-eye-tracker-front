<template>
    <!-- Main container for the canvas and modals -->
    <div class="scroll-container">
        <!-- Canvas for drawing calibration points -->
        <canvas id="canvas" />
        
        <!-- Modal for showing point information (position, precision, accuracy) -->
        <div>
            <PointModal :x="Number(x)" :y="Number(y)" :precision="Number(precision)" :accuracy="Number(accuracy)"
                :dialog="dialog" :pointNumber="pointNumber" @close="dialogCancel" @select="select" />
        </div>
        
        <!-- Modal for configuration settings (calibration settings) -->
        <ConfigModal :configDialog="configDialog" @close="configDialogCancel" @recalib="recalibrate"
            @save="saveCalib" />
        
        <!-- Draggable floating button that opens the configuration modal -->
        <v-col>
            <DraggableFloatingButton @click="callConfigModal" :icon="'mdi-cog'" />
        </v-col>
    </div>
</template>

<script>
// Importing required components
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
            // Initializing default data values
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
        // Initial setup when the component is mounted
        this.initCanvas()
        this.drawCalibPoints()
    },
    computed: {
        // Get calibration data from the store
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
    },
    watch: {
        // Re-draw calibration points when mockPattern or threshold changes
        mockPattern() {
            this.drawCalibPoints()
        },
        threshold() {
            this.drawCalibPoints()
        },
    },
    methods: {
        // Method to open the configuration modal
        callConfigModal() {
            this.configDialog = true
        },
        
        // Select a pattern point from the pattern
        select(pointNumber) {
            this.$store.commit('setMockPatternElement', this.pattern[pointNumber])
        },
        
        // Method to draw calibration points on the canvas
        drawCalibPoints() {
            const pointSize = 3.5
            this.initCanvas()
            for (var i = 0; i < this.pattern.length; i++) {
                // Determine point status (selected or not)
                const isSelected = this.mockPattern.includes(this.pattern[i])
                const crossColor = isSelected ? 'black' : 'grey'
                const dashColor = isSelected ? 'green' : 'red'
                const pointsColor = isSelected ? 'green' : 'orange'
                const centroidColor = isSelected ? 'rgba(0, 0, 255, 0.3)' : 'rgba(128, 128, 128, 0.3)'
                const deniedPointColor = isSelected ? 'blue' : 'grey'

                // Draw calibration marks
                this.drawCalibMarks(this.pattern[i].x, this.pattern[i].y, 30, crossColor)
                var sumX = 0;
                var sumY = 0;
                var count = 0;
                // Draw predicted points and calculate centroid
                for (var a = 0; a < this.pattern[i].predictionX.length; a++) {
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
        
        // Recalibrate the calibration process
        recalibrate() {
            this.$router.push('/calibration/record')
        },
        
        // Save the calibration and redirect to dashboard
        async saveCalib() {
            await this.$store.dispatch('saveCalib')
            this.$router.push('/dashboard')
        },
        
        // Open modal for specific calibration point
        callModal(patternLike, pointNumber) {
            this.x = patternLike.x
            this.y = patternLike.y
            this.precision = patternLike.precision
            this.accuracy = patternLike.accuracy
            this.dialog = true
            this.pointNumber = pointNumber
        },
        
        // Calculate Euclidean distance between two points
        euclidianDistance(x0, x1, y0, y1) {
            const dx = x1 - x0;
            const dy = y1 - y0;
            return Math.sqrt(dx * dx + dy * dy);
        },
        
        // Close the configuration dialog
        configDialogCancel(newDialog) {
            this.configDialog = newDialog
        },
        
        // Close the point information dialog
        dialogCancel(newDialog) {
            this.dialog = newDialog
        },
        
        // Initialize canvas for drawing points
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

                // Check if any calibration points are clicked
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
        
        // Find the point with the largest distance in the pattern
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
        
        // Draw centroid of predicted points
        drawCentroid(x, y, radius, color) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        },
        
        // Draw a circle representing a point on the canvas
        drawPoints(x, y, radius, color) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            ctx.stroke();
            ctx.fill();
        },
        
        // Draw a cross for calibration points
        drawCalibMarks(x, y, crossSize, color) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            const offset = crossSize / 2;
            ctx.beginPath();
            ctx.moveTo(x - offset, y - offset);
            ctx.lineTo(x + offset, y + offset);
            ctx.moveTo(x - offset, y + offset);
            ctx.lineTo(x + offset, y - offset);
            ctx.strokeStyle = color;
            ctx.stroke();
        },
        
        // Draw a dashed line between points
        drawDash(x, y, x1, y1, color) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            const dashLength = 3
            const distance = this.euclidianDistance(x, x1, y, y1)
            const deltaX = (x1 - x) / distance;
            const deltaY = (y1 - y) / distance;

            ctx.beginPath();
            ctx.setLineDash([dashLength, dashLength]);

            let i = 0
            while (i < distance) {
                ctx.moveTo(x + deltaX * i, y + deltaY * i)
                ctx.lineTo(x + deltaX * (i + dashLength), y + deltaY * (i + dashLength))
                i += dashLength * 2;
            }

            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.setLineDash([]);
        },
    }
};
</script>

<style scoped>
/* Style the modal, canvas and the whole layout */
.scroll-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
}
</style>