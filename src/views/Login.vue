<template>
  <!-- Main container, takes up the full height of the viewport -->
  <div style="height:100%">
    <!-- Toolbar component, most likely used for navigation or global settings -->
    <toolbar />
    
    <!-- Vuetify row for centering content vertically and horizontally -->
    <v-row justify="center" align="center" style="height:90%">
      <!-- Column that takes up 12 columns on mobile and 6 columns on larger screens -->
      <v-col cols="12" lg="6" md="6">
        <!-- Card component for styling the login section -->
        <v-card outlined class="py-12">
          <!-- Heading for the login page -->
          <h2 class="text-center">Login</h2>
          
          <!-- Paragraph providing instructions for logging in -->
          <p class="text-center pt-6">
            Login with Google to start creating your usability tests
          </p>
          
          <!-- Row for centering the Google login button -->
          <v-row justify="center" class="mt-12">
            <!-- Google sign-in button -->
            <v-btn id="login-btn-google" large tile class="rounded-0 ma-0" color="#ffffff" @click="login">
              <!-- Google sign-in icon -->
              <v-img height="35px" width="35px" class="signin-icon" src="@/assets/iconGoogle.svg"
                alt="Google sign in - icon">
              </v-img>
              <!-- Button text for signing in with Google -->
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
// Importing the Toolbar component for use in this page
import Toolbar from "@/components/general/Toolbar.vue";

export default {
  components: {
    Toolbar,
  },
  methods: {
    // Method to handle Google sign-in
    async login() {
      // Dispatching the Google sign-in action
      await this.$store.dispatch("signinwithgoogle");
      // Redirecting to the dashboard after successful login
      this.$router.push("/dashboard");
    },
  },
};
</script>