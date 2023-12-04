<template>
    <v-dialog v-model="auxDialog" max-width="500px">
        <v-card>
            <v-card-title class="headline">Modal Title</v-card-title>
            <v-card-text>
                <p>x: {{ x }} y: {{ y }} precision: {{ precision }}</p>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="auxDialog = false">close</v-btn>
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
    },
    data() {
        return {
            auxDialog: false
        }
    },
    watch: {
        dialog(newDialog) {
            this.auxDialog = newDialog
        },
        auxDialog(newAuxDialog) {
            this.$emit('dialogCancel', newAuxDialog);
        }
    }
}
</script>