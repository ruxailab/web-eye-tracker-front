<template>
    <v-dialog v-model="auxDialog" max-width="300px" max-height="500px">
        <v-card>
            <v-card-title class="headline text-center mx-auto">Point {{ pointNumber + 1 }}</v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="6" class="font-weight-bold">(x, y):</v-col>
                        <v-col cols="6" class="text-right">({{ x }}, {{ y }})</v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6" class="font-weight-bold">Accuracy:</v-col>
                        <v-col cols="6" class="text-right">{{ accuracy }} px</v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6" class="font-weight-bold">precision (SD):</v-col>
                        <v-col cols="6" class="text-right">{{ precision }} px</v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
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
        // 'dialog' controls whether the dialog is visible or not
        dialog: {
            type: Boolean,
            default: false
        },
        // 'x' and 'y' are the coordinates of the point
        x: {
            type: Number,
            default: 0
        },
        y: {
            type: Number,
            default: 0
        },
        // 'precision' represents the standard deviation for the point's precision
        precision: {
            type: Number,
            default: 0
        },
        // 'accuracy' represents the accuracy of the point
        accuracy: {
            type: Number,
            default: 0
        },
        // 'pointNumber' indicates the index or number of the current point
        pointNumber: {
            type: Number,
            default: 0
        }
    },
    computed: {
        // Getting the 'pattern' from the Vuex store (used to get all points)
        pattern() {
            return this.$store.state.calibration.pattern
        },
        // Getting the 'mockPattern' from the Vuex store (used to track selected points)
        mockPattern() {
            return this.$store.state.calibration.mockPattern
        },
    },
    // Data section initializes the dialog visibility and selection state
    data() {
        return {
            auxDialog: false, // Controls dialog visibility
            selected: false // Tracks whether the point is selected
        }
    },
    // Watchers monitor changes in props and state
    watch: {
        // Watching for changes in the 'dialog' prop and updating 'auxDialog' accordingly
        dialog(newDialog) {
            this.auxDialog = newDialog
        },
        // Watching for changes in 'auxDialog' and emitting 'close' event to parent
        auxDialog(newAuxDialog) {
            this.$emit('close', newAuxDialog);
        },
        // Watching for changes in 'mockPattern' to update the selection state
        mockPattern(newMockPattern) {
            const point = this.pattern[this.pointNumber]
            this.selected = newMockPattern.includes(point)
        },
        // Watching for changes in 'pointNumber' to update the selection state
        pointNumber(newPointNumber) {
            const point = this.pattern[newPointNumber]
            this.selected = this.mockPattern.includes(point)
        }
    },
    methods: {
        // Method to toggle selection of the point
        select() {
            // Emit a 'select' event to the parent with the current pointNumber
            this.$emit('select', this.pointNumber)
        },
    }
}
</script>
