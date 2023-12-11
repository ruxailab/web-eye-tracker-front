<template>
    <v-dialog v-model="aDialog" max-width="300px" max-height="500px">
        <v-card>
            <v-card-title class="headline text-center mx-auto">recalibrate</v-card-title>
            <v-card-text>
                {{ (mockPattern.length != 0) ? `using ${mockPattern.length} selected points` : `no points selected, using
                all ${pattern.length} points` }}
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="recalibrate">recalib</v-btn>
                <v-btn color="blue darken-1" text @click="goBack">back</v-btn>
                <v-btn color="blue darken-1" text @click="aDialog = false">close</v-btn>

                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
  

<script>
export default {
    props: {
        configDialog: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            aDialog: false
        }
    },
    watch: {
        configDialog(newDialog) {
            this.aDialog = newDialog
        },
        aDialog(newAdialog) {
            this.$emit('close', newAdialog);
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
    methods: {
        recalibrate() {
            this.$emit('recalib');
        },
        goBack(){
            this.$emit('goBack');
        }
    }
}
</script>