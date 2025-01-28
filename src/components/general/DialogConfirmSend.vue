<template>
  <v-dialog v-model="dialog" width="50%" :fullscreen="$vuetify.breakpoint.xsOnly">
    <v-card>
      <v-card-title>Analyze this sample?</v-card-title>
      <v-card-text>We've recorded both your screen and your webcam during the recording time. We need your consent to analyze the videos to create the reports. Do you consent?</v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn outlined color="red" @click="no">No</v-btn>
        <v-btn dark color="success" @click="yes">Yes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  /**
   * DialogConfirmSend component
   * 
   * Props:
   * - dialog (Boolean): Controls the visibility of the dialog.
   * - consent (Boolean): Indicates the user's consent status.
   * 
   * Methods:
   * - yes(): Emits 'consent' event with true and 'dialog' event with false to close the dialog.
   * - no(): Emits 'consent' event with false and 'dialog' event with false to close the dialog.
   */
  export default {
    props:['dialog','consent'],
    methods: {
      yes() {
        this.$emit('consent', true)
        this.$emit('dialog', false)
      },
      no() {
        this.$emit('consent', false)
        this.$emit('dialog', false)
      }
    }
  }
</script>
