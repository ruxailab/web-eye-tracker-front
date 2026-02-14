<template>
    <div class="scroll-container">
        <canvas id="canvas" style="width: 100%; height: 100%;" />

        <PointModal
            :x="Number(x)"
            :y="Number(y)"
            :precision="Number(precision)"
            :accuracy="Number(accuracy)"
            :dialog="dialog"
            :pointNumber="pointNumber"
            @close="dialogCancel"
            @select="select"
        />

        <ConfigModal
            :configDialog="configDialog"
            @close="configDialogCancel"
            @recalib="recalibrate"
            @save="saveCalib"
        />

        <v-col class="pa-0">
            <DraggableFloatingButton
                @click="callConfigModal"
                icon="mdi-cog"
            />
        </v-col>

        <div v-if="redirectingToRuxailab" class="button-overlay">
            <v-btn @click="recalibrate" color="primary">Recalibrate</v-btn>
            <v-btn @click="sendCalibToRuxailab" color="success">
                Send this calib to Ruxailab
            </v-btn>
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
            redirectingToRuxailab: false
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

        drawCalibPoints() {
            console.log('🎨 Iniciando drawCalibPoints')
            console.log('📊 Pattern:', this.pattern)
            console.log('📈 Threshold:', this.threshold)

            this.initCanvas()
            const pointSize = 3.5

            this.pattern.forEach((p, idx) => {
                console.log(`\n🔵 Desenhando ponto ${idx} em (${p.x}, ${p.y})`)
                console.log(`   predictionX: ${p.predictionX?.length || 0} valores`)
                console.log(`   predictionY: ${p.predictionY?.length || 0} valores`)

                this.drawCalibMarks(p.x, p.y, 30, 'grey')

                let sumX = 0
                let sumY = 0
                let count = 0

                p.predictionX?.forEach((px, i) => {
                    const py = p.predictionY[i]
                    const dist = this.euclidianDistance(p.x, px, p.y, py)

                    console.log(`   [${i}] px=${px}, py=${py}, dist=${dist.toFixed(2)}, threshold=${this.threshold}, pass=${dist <= this.threshold}`)

                    this.drawPoints(px, py, pointSize, dist <= this.threshold ? 'green' : 'grey')

                    if (dist <= this.threshold) {
                        sumX += px
                        sumY += py
                        count++
                    }
                })

                console.log(`   ✏️ Total pontos dentro threshold: ${count}`)

                if (count > 0) {
                    const cx = sumX / count
                    const cy = sumY / count
                    console.log(`   🎯 Centróide em (${cx.toFixed(2)}, ${cy.toFixed(2)})`)
                    this.drawDash(cx, cy, p.x, p.y, 'red')
                    this.drawCentroid(cx, cy, 1 + (p.precision || 0) * 25, 'rgba(0,0,255,0.3)')
                }
            })
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

        async saveCalib() {
            await this.$store.dispatch('saveCalib')
            this.$router.push('/dashboard')
        }
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