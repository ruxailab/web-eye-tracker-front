<template>
    <v-dialog v-model="auxDialog" max-width="300px" max-height="500px">
        <v-card>
            <v-card-title class="headline text-center mx-auto">hi</v-card-title>
            <v-card-text>
                hi
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text>hi</v-btn>
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
        }
    },
    watch: {
        dialog(newDialog) {
            this.auxDialog = newDialog
        },
        auxDialog(newAuxDialog) {
            this.$emit('close', newAuxDialog);
        },
    },
    methods: {
    }
}
</script>