<template>
  <div id="box">
    <Toolbar />
    <v-container class="mt-12">
      <v-row justify="center" align="start">
        <v-col cols="12" lg="5" md="5">
          <v-card outlined>
            <v-card-title>
              <v-icon left>mdi-information</v-icon>
              Calibration System
            </v-card-title>
            <p class="mx-4">
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
            </p>
            <v-card-actions class="px-4 mt-12 mb-4">
              <v-btn block outlined color="green" @click="goToCameraConfig()">Start
                Calibration</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import Toolbar from "@/components/general/Toolbar.vue";
import axios from "axios";

export default {
  components: {
    Toolbar,
  },
  methods: {
    async goToCameraConfig() {
      try {
        const res = await axios.get("/api/session/health");

        if (res.status === 200 && res.data.status === "ok") {
          this.$router.push("/calibration/configuration");
        } else {
          alert("API is not ready. Please try again later.");
        }
      } catch (err) {
        alert("Cannot reach backend. Is the API running?");
      }
    },
 
  },
};
</script>

