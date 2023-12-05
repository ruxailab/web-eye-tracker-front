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
                        <v-col cols="6" class="font-weight-bold">precision:</v-col>
                        <v-col cols="6" class="text-right">{{ precision }}</v-col>
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
        pointNumber: {
            type: Number,
            default: 0
        }
    },
    computed: {
        pattern() {
            return this.$store.state.calibration.pattern
        },
        mockPattern() {
            return this.$store.state.calibration.mockPattern
        },
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
        },
        auxDialog(newAuxDialog) {
            this.$emit('close', newAuxDialog);
        },
        mockPattern(newMockPattern) {
            const point = this.pattern[this.pointNumber]
            this.selected = newMockPattern.includes(point)
        },
        pointNumber(newPointNumber) {
            const point = this.pattern[newPointNumber]
            this.selected = this.mockPattern.includes(point)
        }
    },
    methods: {
        select() {
            this.$emit('select', this.pointNumber)
        },
    }
}
</script>