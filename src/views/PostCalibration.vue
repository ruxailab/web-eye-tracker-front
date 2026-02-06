<template>
    <div class="scroll-container">
        <canvas
            id="canvas"
            style="width: 100%; height: 100%;"
            @click="handleCanvasClick"
        />
        <div>
            <PointModal :x="Number(x)" :y="Number(y)" :precision="Number(precision)" :accuracy="Number(accuracy)"
                :dialog="dialog" :pointNumber="pointNumber" :predictionX="predictionX" :predictionY="predictionY"
                @close="dialogCancel" @select="select" />
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
import PointModal from '@/components/calibration/PointModal.vue'
import DraggableFloatingButton from '@/components/general/DraggableFloatingButton.vue'
import ConfigModal from '@/components/calibration/ConfigModal.vue'

export default {
    components: {
        PointModal,
        DraggableFloatingButton,
        ConfigModal
    },

    data() {
        return {
            x: 0,
            y: 0,
            precision: 0,
            accuracy: 0,
            dialog: false,
            configDialog: false,
            pointNumber: 0,
            predictionX: [],
            predictionY: []
        }
    },

    async mounted() {
        await this.verifyFromRuxailab()
        this.applyCalibResult()
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
        pattern() {
            return this.$store.state.calibration.runtime.usedPattern
        },
        mockPattern() {
            return this.$store.state.calibration.mockPattern
        },
        threshold() {
            return this.$store.state.calibration.threshold
        },
        fromDashboard() {
            return this.$store.state.calibration.fromDashboard
        },
        calibValidationResult() {
            return this.$store.state.predict.calibValidationResult
        },
        circleIrisPoints() {
            return this.$store.state.calibration.runtime.circleIrisPoints
        },
        calibPredictionPoints() {
            return this.$store.state.calibration.runtime.calibPredictionPoints
        }
    },

    watch: {
        threshold() {
            this.drawCalibPoints()
        },
        mockPattern() {
            this.drawCalibPoints()
        }
    },

    methods: {
        applyCalibResult() {
            if (!this.calibValidationResult) {
                console.warn('❌ calibValidationResult é null/undefined')
                return
            }

            console.log('✅ calibValidationResult encontrado:', this.calibValidationResult)

            const adapted = this.pattern.map((p, idx) => {
                const xKey = Math.round(p.x).toString()
                const yKey = Math.round(p.y).toString()

                console.log(`📍 Ponto ${idx}: x=${p.x}, y=${p.y} -> keys: ${xKey}, ${yKey}`)

                const data = this.calibValidationResult?.[xKey]?.[yKey]

                if (!data) {
                    console.warn(`⚠️ Nenhum dado para ponto ${idx} (${xKey}, ${yKey})`)
                    return {
                        ...p,
                        predictionX: [],
                        predictionY: [],
                        precision: null,
                        accuracy: null
                    }
                }

                console.log(`✅ Dados encontrados para ponto ${idx}:`, data)
                return {
                    ...p,
                    predictionX: data.predicted_x || [],
                    predictionY: data.predicted_y || [],
                    precision: data.PrecisionSD,
                    accuracy: data.Accuracy
                }
            })

            this.$store.commit('setCalibrationPattern', adapted)
        },

        async verifyFromRuxailab() {
            const params = new URLSearchParams(window.location.search)
            this.redirectingToRuxailab = params.has('redirectingToRuxailab')
        },

        callConfigModal() {
            this.configDialog = true
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
                threshold: this.threshold
            })
        },

        select(pointNumber) {
            this.$store.commit(
                'setMockPatternElement',
                this.pattern[pointNumber]
            )
        },

        handleCanvasClick(event) {
            const canvas = event.currentTarget
            const rect = canvas.getBoundingClientRect()
            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height
            const clickX = (event.clientX - rect.left) * scaleX
            const clickY = (event.clientY - rect.top) * scaleY

            let closestIndex = -1
            let minDist = Infinity
            const hitRadius = 30

            for (let i = 0; i < this.pattern.length; i++) {
                const p = this.pattern[i]
                const dist = this.euclidianDistance(p.x, clickX, p.y, clickY)
                if (dist < minDist) {
                    minDist = dist
                    closestIndex = i
                }
            }

            if (closestIndex !== -1 && minDist <= hitRadius) {
                this.callModal(this.pattern[closestIndex], closestIndex)
            }
        },

        drawCalibPoints() {
            const pointSize = 3.5
            this.initCanvas()
            for (var i = 0; i < this.pattern.length; i++) {
                // calib points
                const isSelected = this.mockPattern.some(
                    (p) => p.x === this.pattern[i].x && p.y === this.pattern[i].y
                )
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
            this.predictionX = patternLike.predictionX || []
            this.predictionY = patternLike.predictionY || []
            this.dialog = true
            this.pointNumber = pointNumber
        },

        euclidianDistance(x0, x1, y0, y1) {
            return Math.hypot(x1 - x0, y1 - y0)
        },

        initCanvas() {
            const canvas = document.getElementById('canvas')
            console.log('🖼️ Canvas:', canvas)
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight

            const ctx = canvas.getContext('2d')
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = this.backgroundColor
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        },

        drawCentroid(x, y, r, color) {
            const ctx = document.getElementById('canvas').getContext('2d')
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(x, y, r, 0, Math.PI * 2)
            ctx.fill()
        },

        drawPoints(x, y, r, color) {
            const ctx = document.getElementById('canvas').getContext('2d')
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(x, y, r, 0, Math.PI * 2)
            ctx.fill()
        },

        drawCalibMarks(x, y, s, color) {
            const ctx = document.getElementById('canvas').getContext('2d')
            ctx.strokeStyle = color

            ctx.beginPath()
            ctx.moveTo(x - s, y)
            ctx.lineTo(x + s, y)
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo(x, y - s)
            ctx.lineTo(x, y + s)
            ctx.stroke()
        },

        drawDash(fx, fy, tx, ty, color) {
            const ctx = document.getElementById('canvas').getContext('2d')
            ctx.strokeStyle = color
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(fx, fy)
            ctx.lineTo(tx, ty)
            ctx.stroke()
            ctx.setLineDash([])
        },

        dialogCancel(v) {
            this.dialog = v
        },

        configDialogCancel(v) {
            this.configDialog = v
        },
    }
}
</script>

<style>
.scroll-container {
    width: 100%;
    position: relative;
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
    display: flex;
    gap: 12px;
}
</style>
