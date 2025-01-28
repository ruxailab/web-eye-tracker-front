<!-- Calibration Dialog Component
     A draggable dialog for recalibrating eye tracking settings with distance threshold adjustment -->
     <template>
        <v-dialog v-model="aDialog" max-width="400px" max-height="500px">
            <!-- Main card container with drag functionality -->
            <v-card class="maincard" ref="draggableCard">
                <!-- Drag handle section with first-time user instructions -->
                <div class="dragbox">
                    <v-icon class="dragicon" @mousedown="startDrag">{{ 'mdi-drag' }}</v-icon>
                    <!-- First-time user instruction tooltip -->
                    <div v-if="showInfo" class="draginfo">
                        <v-icon class="lefticon">{{ 'mdi-menu-left' }}</v-icon>
                        Use this icon to drag the modal
                        <v-btn variant="outlined" @click="closeinfo">OK</v-btn>
                    </div>
                </div>
    
                <!-- Dialog content -->
                <v-card-title class="headline text-center mx-auto">recalibrate</v-card-title>
                <v-card-text>
                    {{ (mockPattern.length != 0) ? `using ${mockPattern.length} selected points` : `no points selected,
                    using all ${pattern.length} points` }}
                </v-card-text>
    
                <!-- Threshold adjustment slider -->
                <Slider 
                    :value="threshold" 
                    :min="Number(0)" 
                    :step="5" 
                    :max="Number(1000)" 
                    label="Points Distance Threshold"
                    @input="updateThreshold" 
                />
    
                <!-- Action buttons -->
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" :disabled="fromDashboard" text @click="recalibrate">recalib</v-btn>
                    <v-btn color="blue darken-1" :disabled="fromDashboard" text @click="save">save</v-btn>
                    <v-btn color="blue darken-1" text @click="aDialog = false">close</v-btn>
                    <v-spacer></v-spacer>
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
    
        // Dialog visibility control from parent
        props: {
            configDialog: {
                type: Boolean,
                default: false
            }
        },
    
        // Component state management
        data() {
            return {
                aDialog: false,
                dragging: false,
                initialMouseX: 0,
                initialMouseY: 0,
                initialClientX: 200,
                initialClientY: 100,
                deltaX: 0,
                deltaY: 0,
                startTime: 0,
                showInfo: true  // Controls first-time user instruction visibility
            }
        },
    
        // Sync dialog state with parent and emit events
        watch: {
            configDialog(newDialog) {
                this.aDialog = newDialog
            },
            aDialog(newAdialog) {
                this.$emit('close', newAdialog);
            },
        },
    
        // Vuex store computed properties
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
            // Threshold update handler
            updateThreshold(value) {
                this.$store.commit('setThreshold', value);
            },
    
            // Calibration action handlers
            recalibrate() {
                this.$emit('recalib');
            },
            save() {
                this.$emit('save');
            },
    
            // Drag functionality methods
            startDrag(event) {
                this.showInfo = false
                this.dragging = true;
                this.startTime = new Date();
                this.initialMouseX = event.clientX;
                this.initialMouseY = event.clientY;
                const rect = this.$refs.draggableCard.$el.getBoundingClientRect();
                this.initialClientX = rect.left - 20;
                this.initialClientY = rect.top - 240;
    
                window.addEventListener("mousemove", this.handleDrag);
                window.addEventListener("mouseup", this.endDrag);
            },
    
            handleDrag(event) {
                if (this.dragging) {
                    this.deltaX = event.clientX - this.initialMouseX;
                    this.deltaY = event.clientY - this.initialMouseY;
                    this.$refs.draggableCard.$el.style.left = this.initialClientX + this.deltaX + "px";
                    this.$refs.draggableCard.$el.style.top = this.initialClientY + this.deltaY + "px";
                }
            },
    
            endDrag() {
                if (this.dragging) {
                    this.dragging = false;
                    if (this.deltaX == 0 && this.deltaY == 0) {
                        this.handleClick()
                    }
                    this.deltaX = 0
                    this.deltaY = 0
                }
            },
    
            // Click handler for non-drag interactions
            handleClick(event) {
                if (!this.dragging) {
                    this.$emit('click', event);
                }
            },
    
            // Close first-time user instructions
            closeinfo() {
                this.showInfo = false;
            }
        },
    }
    </script>
    
    <style>
    /* Main card shadow for visual depth */
    .maincard {
        box-shadow: 0px 11px 15px -7px rgba(0, 0, 0, 0.2), 
                    0px 24px 38px 3px rgba(0, 0, 0, 0.14), 
                    0px 9px 46px 8px rgba(0, 0, 0, 0.12) !important;
    }
    
    /* Drag handle styling */
    .dragicon {
        cursor: pointer;
    }
    
    .dragbox {
        position: absolute !important;
        top: 20px;
        right: 18px;
    }
    
    /* First-time user instruction tooltip styling */
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