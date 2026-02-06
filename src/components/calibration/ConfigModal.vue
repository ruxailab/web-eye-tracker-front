<template>
    <v-dialog v-model="aDialog" max-width="400px" max-height="500px">
        <v-card class="maincard" ref="draggableCard">
            <div class="dragbox">
                <v-icon class="dragicon" @mousedown="startDrag">{{ 'mdi-drag' }}</v-icon>
                <div v-if="showInfo" class="draginfo">
                    <v-icon class="lefticon">{{ 'mdi-menu-left' }}</v-icon>
                    Use this icon to drag the modal
                    <v-btn variant="outlined" @click="closeinfo">OK</v-btn>
                </div>
            </div>
            <v-card-title class="headline text-center mx-auto">recalibrate</v-card-title>
            <v-card-text>
                {{ (mockPattern.length != 0) ? `using ${mockPattern.length} selected points` : `no points selected,
                using
                all ${pattern.length} points` }}
            </v-card-text>
            <Slider :value="threshold" :min="Number(0)" :step="5" :max="Number(1000)" label="Points Distance Threshold"
                @input="updateThreshold" />
            <v-card-actions class="justify-center">
                <v-btn color="primary" text class="text-none" :disabled="fromDashboard" @click="recalibrate">RECALIB</v-btn>
                <v-btn color="primary" text class="text-none" :disabled="fromDashboard" @click="save">SAVE</v-btn>
                <v-btn color="primary" text class="text-none" @click="aDialog = false">CLOSE</v-btn>
                <v-btn color="error" text class="text-none" @click="exitToDashboard">EXIT</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>


<script>
import Slider from '@/components/general/Slider.vue'
export default {
    components: {
        Slider
    },
    props: {
        configDialog: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            aDialog: false,
            isDragging: false,
            hasMoved: false,
            initialMouseX: 0,
            initialMouseY: 0,
            initialCardX: 0,
            initialCardY: 0,
            cardWidth: 0,
            showInfo: true
        }
    },
    watch: {
        configDialog(newDialog) {
            this.aDialog = newDialog
        },
        aDialog(newAdialog) {
            this.$emit('close', newAdialog);
            
            // Reset positioning when modal closes
            if (!newAdialog && this.$refs.draggableCard) {
                this.$nextTick(() => {
                    const cardEl = this.$refs.draggableCard.$el;
                    if (cardEl) {
                        cardEl.style.position = '';
                        cardEl.style.left = '';
                        cardEl.style.top = '';
                        cardEl.style.width = '';
                        cardEl.style.margin = '';
                    }
                });
            }
        },
    },
    computed: {
        threshold() {
            return this.$store.state.calibration.threshold;
        },
        pattern() {
            return this.$store.state.calibration.pattern
        },
        mockPattern() {
            return this.$store.state.calibration.mockPattern
        },
        fromDashboard() {
            return this.$store.state.calibration.fromDashboard
        },
    },
    methods: {
        updateThreshold(value) {
            this.$store.commit('setThreshold', value);
        },
        recalibrate() {
            this.$emit('recalib');
        },
        save() {
            this.$emit('save');
        },
        startDrag(event) {
            this.showInfo = false;
            this.isDragging = true;
            this.hasMoved = false;
            
            // Store initial mouse position
            this.initialMouseX = event.clientX;
            this.initialMouseY = event.clientY;

            window.addEventListener("mousemove", this.handleDrag);
            window.addEventListener("mouseup", this.endDrag);
            
            // Prevent text selection while dragging
            event.preventDefault();
        },
        handleDrag(event) {
            if (!this.isDragging) return;
            
            const deltaX = event.clientX - this.initialMouseX;
            const deltaY = event.clientY - this.initialMouseY;
            
            // Only start actual dragging if moved more than 5 pixels (helps distinguish clicks from drags)
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance < 5) return;
            
            const cardEl = this.$refs.draggableCard.$el;
            
            // On first move, set up the card for dragging
            if (!this.hasMoved) {
                this.hasMoved = true;
                const rect = cardEl.getBoundingClientRect();
                this.initialCardX = rect.left;
                this.initialCardY = rect.top;
                this.cardWidth = rect.width;
                
                // Apply fixed positioning
                cardEl.style.position = 'fixed';
                cardEl.style.width = this.cardWidth + 'px';
                cardEl.style.margin = '0';
                cardEl.style.left = this.initialCardX + 'px';
                cardEl.style.top = this.initialCardY + 'px';
            }
            
            // Update position based on mouse movement
            cardEl.style.left = (this.initialCardX + deltaX) + 'px';
            cardEl.style.top = (this.initialCardY + deltaY) + 'px';
        },
        endDrag() {
            window.removeEventListener("mousemove", this.handleDrag);
            window.removeEventListener("mouseup", this.endDrag);
            
            this.isDragging = false;
            
            // If we didn't move, treat it as a click (not a drag)
            if (!this.hasMoved) {
                this.handleClick();
            }
            
            this.hasMoved = false;
        },
        handleClick(event) {
            // This is called when user clicks without dragging
            this.$emit('click', event);
        },
        closeinfo() {
            this.showInfo = false;
        },
        exitToDashboard() {
            this.$store.commit('calibration/resetAll');
            this.$router.push('/dashboard');
        },
    },
}
</script>


<style>
.maincard {
    box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12) !important;
}

.dragicon {
    cursor: pointer;
}

.dragbox {
    position: absolute !important;
    top: 20px;
    right: 18px;
}

.draginfo {
    position: absolute;
    right: -330px;
    top: 0px;
    background-color: rgba(0, 0, 0, 0.12);
    border-radius: 5px;
    padding: 2px 4px;
    color: white;
}

.lefticon {
    position: absolute;
    left: -6px;
    width: 0;
}
</style>