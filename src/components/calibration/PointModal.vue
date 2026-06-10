<template>
    <v-dialog v-model="auxDialog" max-width="450px" scrollable>
        <v-card>
            <v-card-title class="headline d-flex justify-space-between align-center py-3">
                <span>Point {{ pointNumber + 1 }}</span>
                <v-chip v-if="selected" color="primary" small>
                    <v-icon small left>mdi-checkbox-marked-circle</v-icon>
                    SELECTED
                </v-chip>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="modal-content">
                <v-container>
                    <!-- Basic Info -->
                    <v-row>
                        <v-col cols="6" class="font-weight-bold">Position (x, y):</v-col>
                        <v-col cols="6" class="text-right">({{ x }}, {{ y }})</v-col>
                    </v-row>
                    
                    <!-- Accuracy with color indicator -->
                    <v-row>
                        <v-col cols="6" class="font-weight-bold">Accuracy:</v-col>
                        <v-col cols="6" class="text-right d-flex justify-end align-center">
                            {{ accuracyDisplay }} px
                            <v-icon :color="accuracyColor" small class="ml-2">mdi-circle</v-icon>
                        </v-col>
                    </v-row>
                    
                    <!-- Precision with color indicator -->
                    <v-row>
                        <v-col cols="6" class="font-weight-bold">Precision (SD):</v-col>
                        <v-col cols="6" class="text-right d-flex justify-end align-center">
                            {{ precisionDisplay }} px
                            <v-icon :color="precisionColor" small class="ml-2">mdi-circle</v-icon>
                        </v-col>
                    </v-row>

                    <v-divider class="my-2"></v-divider>

                    <!-- Sample Statistics -->
                    <v-row v-if="hasPredictionData">
                        <v-col cols="6" class="font-weight-bold">Total Samples:</v-col>
                        <v-col cols="6" class="text-right">{{ totalSamples }}</v-col>
                    </v-row>
                    
                    <v-row v-if="hasPredictionData">
                        <v-col cols="12" class="font-weight-bold mb-1">Within Threshold:</v-col>
                        <v-col cols="12">
                            <div class="d-flex justify-space-between mb-1">
                                <span>{{ samplesWithinThreshold }}/{{ totalSamples }} ({{ thresholdPercentage }}%)</span>
                            </div>
                            <v-progress-linear
                                :value="parseFloat(thresholdPercentage)"
                                :color="thresholdColor"
                                height="8"
                                rounded
                            ></v-progress-linear>
                        </v-col>
                    </v-row>

                    <v-row v-if="hasPredictionData">
                        <v-col cols="6" class="font-weight-bold">Centroid Offset:</v-col>
                        <v-col cols="6" class="text-right">{{ centroidDistance }} px</v-col>
                    </v-row>
                    
                    <v-row v-if="hasPredictionData">
                        <v-col cols="6" class="font-weight-bold">Distance Range:</v-col>
                        <v-col cols="6" class="text-right">{{ minDistance }} - {{ maxDistance }} px</v-col>
                    </v-row>

                    <!-- Scatter Plot Visualization -->
                    <v-divider class="my-2" v-if="hasPredictionData"></v-divider>
                    <v-row v-if="hasPredictionData">
                        <v-col cols="12" class="text-center py-2">
                            <div class="font-weight-bold mb-2">Prediction Distribution</div>
                            <div class="scatter-container">
                                <canvas ref="scatterCanvas" width="200" height="200"></canvas>
                            </div>
                            <div class="legend mt-1">
                                <span class="legend-item">
                                    <v-icon x-small color="orange">mdi-circle</v-icon> <span class="text-caption">Within</span>
                                </span>
                                <span class="legend-item ml-2">
                                    <v-icon x-small color="blue">mdi-circle</v-icon> <span class="text-caption">Outside</span>
                                </span>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="py-3">
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="select">{{ selected ? 'unselect' : 'select' }}</v-btn>
                <v-btn color="blue darken-1" text @click="auxDialog = false">close</v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
  

<script>
export default {
    props: {
        dialog: {
            type: Boolean,
            default: false
        },
        x: {
            type: Number,
            default: 0
        },
        y: {
            type: Number,
            default: 0
        },
        precision: {
            type: Number,
            default: 0
        },
        accuracy: {
            type: Number,
            default: 0
        },
        pointNumber: {
            type: Number,
            default: 0
        },
        predictionX: {
            type: Array,
            default: () => []
        },
        predictionY: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        pattern() {
            return this.$store.state.calibration.pattern
        },
        mockPattern() {
            return this.$store.state.calibration.mockPattern
        },
        threshold() {
            return this.$store.state.calibration.threshold
        },
        hasPredictionData() {
            return this.predictionX.length > 0 && this.predictionY.length > 0
        },
        totalSamples() {
            return this.predictionX.length
        },
        accuracyDisplay() {
            return this.accuracy.toFixed(2)
        },
        precisionDisplay() {
            return this.precision.toFixed(2)
        },
        accuracyColor() {
            if (this.accuracy < 3) return 'green'
            if (this.accuracy < 5) return 'orange'
            return 'red'
        },
        precisionColor() {
            if (this.precision < 2) return 'green'
            if (this.precision < 4) return 'orange'
            return 'red'
        },
        samplesWithinThreshold() {
            if (!this.hasPredictionData) return 0
            return this.predictionX.filter((x, i) => {
                const dist = this.euclidianDistance(this.x, x, this.y, this.predictionY[i])
                return dist <= this.threshold
            }).length
        },
        thresholdPercentage() {
            if (!this.hasPredictionData) return '0.0'
            return ((this.samplesWithinThreshold / this.totalSamples) * 100).toFixed(1)
        },
        thresholdColor() {
            const percentage = parseFloat(this.thresholdPercentage)
            if (percentage >= 80) return 'green'
            if (percentage >= 60) return 'orange'
            return 'red'
        },
        centroidDistance() {
            if (!this.hasPredictionData) return '0.00'
            let sumX = 0
            let sumY = 0
            let count = 0
            
            this.predictionX.forEach((x, i) => {
                const dist = this.euclidianDistance(this.x, x, this.y, this.predictionY[i])
                if (dist <= this.threshold) {
                    sumX += x
                    sumY += this.predictionY[i]
                    count++
                }
            })
            
            if (count === 0) return '0.00'
            const centroidX = sumX / count
            const centroidY = sumY / count
            return this.euclidianDistance(this.x, centroidX, this.y, centroidY).toFixed(2)
        },
        minDistance() {
            if (!this.hasPredictionData) return '0.00'
            const distances = this.predictionX.map((x, i) => 
                this.euclidianDistance(this.x, x, this.y, this.predictionY[i])
            )
            return Math.min(...distances).toFixed(2)
        },
        maxDistance() {
            if (!this.hasPredictionData) return '0.00'
            const distances = this.predictionX.map((x, i) => 
                this.euclidianDistance(this.x, x, this.y, this.predictionY[i])
            )
            return Math.max(...distances).toFixed(2)
        }
    },
    data() {
        return {
            auxDialog: false,
            selected: false
        }
    },
    watch: {
        dialog(newDialog) {
            this.auxDialog = newDialog
            if (newDialog && this.hasPredictionData) {
                this.$nextTick(() => {
                    this.drawScatterPlot()
                })
            }
        },
        auxDialog(newAuxDialog) {
            this.$emit('close', newAuxDialog);
        },
        mockPattern(newMockPattern) {
            const point = this.pattern[this.pointNumber]
            this.selected = newMockPattern.some(
                (p) => p.x === point.x && p.y === point.y
            )
        },
        pointNumber(newPointNumber) {
            const point = this.pattern[newPointNumber]
            this.selected = this.mockPattern.some(
                (p) => p.x === point.x && p.y === point.y
            )
        }
    },
    methods: {
        select() {
            this.$emit('select', this.pointNumber)
        },
        euclidianDistance(x0, x1, y0, y1) {
            const dx = x1 - x0
            const dy = y1 - y0
            return Math.sqrt(dx * dx + dy * dy)
        },
        drawScatterPlot() {
            if (!this.$refs.scatterCanvas || !this.hasPredictionData) return
            
            const canvas = this.$refs.scatterCanvas
            const ctx = canvas.getContext('2d')
            const width = canvas.width
            const height = canvas.height
            const padding = 30
            
            // Clear canvas
            ctx.fillStyle = '#f5f5f5'
            ctx.fillRect(0, 0, width, height)
            
            // Find bounds for scaling
            const allX = [...this.predictionX, this.x]
            const allY = [...this.predictionY, this.y]
            const minX = Math.min(...allX)
            const maxX = Math.max(...allX)
            const minY = Math.min(...allY)
            const maxY = Math.max(...allY)
            
            // Add some margin to bounds
            const rangeX = maxX - minX || 100
            const rangeY = maxY - minY || 100
            const marginX = rangeX * 0.1
            const marginY = rangeY * 0.1
            
            // Scale function
            const scaleX = (x) => padding + ((x - minX + marginX) / (rangeX + 2 * marginX)) * (width - 2 * padding)
            const scaleY = (y) => padding + ((y - minY + marginY) / (rangeY + 2 * marginY)) * (height - 2 * padding)
            
            // Draw grid
            ctx.strokeStyle = '#e0e0e0'
            ctx.lineWidth = 1
            for (let i = 0; i <= 4; i++) {
                const gridX = padding + (i / 4) * (width - 2 * padding)
                const gridY = padding + (i / 4) * (height - 2 * padding)
                ctx.beginPath()
                ctx.moveTo(gridX, padding)
                ctx.lineTo(gridX, height - padding)
                ctx.stroke()
                ctx.beginPath()
                ctx.moveTo(padding, gridY)
                ctx.lineTo(width - padding, gridY)
                ctx.stroke()
            }
            
            // Draw threshold circle around target
            const targetX = scaleX(this.x)
            const targetY = scaleY(this.y)
            const thresholdRadius = (this.threshold / rangeX) * (width - 2 * padding)
            
            ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.arc(targetX, targetY, thresholdRadius, 0, Math.PI * 2)
            ctx.stroke()
            ctx.setLineDash([])
            
            // Draw prediction points
            this.predictionX.forEach((x, i) => {
                const y = this.predictionY[i]
                const dist = this.euclidianDistance(this.x, x, this.y, y)
                const px = scaleX(x)
                const py = scaleY(y)
                
                ctx.fillStyle = dist <= this.threshold ? 'rgba(255, 152, 0, 0.6)' : 'rgba(33, 150, 243, 0.6)'
                ctx.beginPath()
                ctx.arc(px, py, 3, 0, Math.PI * 2)
                ctx.fill()
            })
            
            // Draw centroid
            let sumX = 0
            let sumY = 0
            let count = 0
            this.predictionX.forEach((x, i) => {
                const dist = this.euclidianDistance(this.x, x, this.y, this.predictionY[i])
                if (dist <= this.threshold) {
                    sumX += x
                    sumY += this.predictionY[i]
                    count++
                }
            })
            
            if (count > 0) {
                const centroidX = scaleX(sumX / count)
                const centroidY = scaleY(sumY / count)
                ctx.fillStyle = 'rgba(76, 175, 80, 0.5)'
                ctx.strokeStyle = 'rgba(76, 175, 80, 1)'
                ctx.lineWidth = 2
                ctx.beginPath()
                ctx.arc(centroidX, centroidY, 6, 0, Math.PI * 2)
                ctx.fill()
                ctx.stroke()
            }
            
            // Draw target point (calibration point) as crosshair
            ctx.strokeStyle = 'black'
            ctx.lineWidth = 2
            const crossSize = 12
            ctx.beginPath()
            ctx.moveTo(targetX - crossSize, targetY)
            ctx.lineTo(targetX + crossSize, targetY)
            ctx.moveTo(targetX, targetY - crossSize)
            ctx.lineTo(targetX, targetY + crossSize)
            ctx.stroke()
        }
    }
}
</script>

<style scoped>
.modal-content {
    max-height: 70vh;
    overflow-y: auto;
}

.scatter-container {
    display: flex;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 8px;
}

.legend {
    font-size: 11px;
    color: #666;
}

.legend-item {
    display: inline-flex;
    align-items: center;
    gap: 2px;
}

/* Compact row spacing */
.v-card-text .v-row {
    margin-bottom: 0;
}

.v-card-text .v-row + .v-row {
    margin-top: 4px;
}
</style>
