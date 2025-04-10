<template>
  <div style="height: 100%;">
    <!-- Toolbar with Calibration event -->
    <Toolbar @calibrate="startCalibration" />

    <!-- Login Card Layout -->
    <v-row justify="center" align="center" style="height: 90%;">
      <v-col cols="12" lg="6" md="6">
        <v-card outlined class="py-12">
          <h2 class="text-center">Login</h2>
          <p class="text-center pt-6">
            Login with Google to start creating your usability tests
          </p>

          <!-- Google Login Button -->
          <v-row justify="center" class="mt-12">
            <v-btn
              id="login-btn-google"
              large
              tile
              class="rounded-0 ma-0"
              color="#ffffff"
              @click="login"
            >
              <v-img
                height="35px"
                width="35px"
                class="signin-icon"
                src="@/assets/iconGoogle.svg"
                alt="Google sign in - icon"
              />
              <p class="pl-1 pr-1 ma-0 text-center text-capitalize">
                Sign in with Google
              </p>
            </v-btn>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Toolbar from "@/components/general/Toolbar.vue";

export default {
  name: "Login",
  components: {
    Toolbar,
  },
  methods: {
    // Handles login with Google
    async login() {
      try {
        await this.$store.dispatch("signinwithgoogle");
        this.$router.push("/dashboard");
      } catch (error) {
        console.error("Login failed:", error);
      }
    },

    // Triggered by Calibration button from Toolbar
    startCalibration() {
      console.log("Calibration started!");
      this.$store.dispatch("startCalibration"); // Make sure this action exists
    },
  },
};
</script>

<style scoped>
.signin-icon {
  object-fit: contain;
}
</style>

