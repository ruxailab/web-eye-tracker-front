<!--
  This Vue component represents a calibration card view for a calibration system.
  It includes a toolbar, a card with information about the calibration process, 
  and a button to start the calibration.

  Template:
  - A div with id "box" containing:
    - Toolbar component.
    - A container with a row and column layout.
    - A card with a title, description, and a button to start the calibration.

  Script:
  - Imports the Toolbar component.
  - Defines a method `goToCameraConfig` that navigates to the camera configuration route.
-->
<template>
  <div id="box">
    <Toolbar />
    <v-container class="d-flex justify-center align-center fill-height">
      <v-row justify="center" align="center">
        <v-col cols="12" lg="5" md="6" sm="8">
          <v-card outlined class="mx-auto" max-width="500">
            <v-card-title class="text-center">
              <v-icon left>mdi-information</v-icon>
              Calibration System
            </v-card-title>
            <v-card-text class="text-center">
              The calibration works by associating the position of your eyes'
              iris with the coordinates of the circle on the screen.
              <br /><br />
              Before starting the process, turn on the camera and make sure your
              face and eyes are being captured by the model. After clicking
              start please don't leave the current position.
              <br /><br />
              Your task during the calibration is to follow the circles with
              your eyes. Try your best to not look away and to keep following.
              Blinking is fine.
            </v-card-text>
            <v-card-actions class="d-flex justify-center">
              <v-btn outlined color="green" @click="startCalibration">
                Start Calibration
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Popup Dialog -->
    <v-dialog v-model="showError" persistent max-width="400" content-class="dialog-center">
      <v-card>
        <v-card-title class="red--text text-center">
          API Error
        </v-card-title>
        <v-card-text class="text-center">
          Unable to start calibration. The API is not running.
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <v-btn color="red" text @click="showError = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import Toolbar from "@/components/general/Toolbar.vue";

export default {
  components: {
    Toolbar,
  },
  data() {
    return {
      showError: false,
    };
  },
  methods: {
    async startCalibration() {
      const API_BASE_URL = process.env.VUE_APP_API_BASE_URL;
      try {
        await axios.get(`${API_BASE_URL}/api/health`);
        this.$router.push("/calibration/configuration");
      } catch (error) {
        this.showError = true;
      }
    },
  },
};
</script>

<style>
.dialog-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>