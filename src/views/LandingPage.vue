<template>
  <!-- The main container with a background image, dynamic URL using Vue's asset loading -->
  <div class="bg" :style="{ backgroundImage: 'url(' + require('@/assets/landing.png') + ')' }">
    <!-- Invisible Toolbar component, probably used for global navigation or settings -->
    <invisible-toolbar />
    
    <!-- Main content container, using Vuetify's container component for responsive layout -->
    <v-container>
      <!-- Row to structure content, aligning it to the left (start) -->
      <v-row justify="start" class="mt-12">
        <!-- Column that takes full width on mobile and 6 columns on large screens -->
        <v-col cols="12" lg="6" md="4">
          <!-- Heading for the page, styled with white text -->
          <h1 class="white--text">Eye Lab</h1>
          
          <!-- Description paragraph, dynamic text with custom styling -->
          <p class="white--text mt-12" style="font-size:20px">{{ desc }}</p>
          
          <!-- Row for positioning the 'Get Started' button -->
          <v-row justify="start" class="mt-12">
            <!-- Button that links to the dashboard, styled with dark outline -->
            <v-btn dark outlined class="mt-12" to="/dashboard">get started</v-btn>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
// Importing the InvisibleToolbar component for usage in this component
import InvisibleToolbar from "@/components/general/Toolbar.vue";

export default {
  // Registering the InvisibleToolbar component to be used within the template
  components: {
    InvisibleToolbar,
  },
  data() {
    return {
      // Description text used in the landing page
      desc: 'An open source and free tool for creating usability tests using only your eyes and your webcam'
    }
  }
};
</script>

<style scoped>
/* Styling for the background image container */
.bg {
  height: 100%;  /* Full viewport height */
  background-color: black;  /* Fallback color in case image doesn't load */
  background-position: 0%;  /* Position the image to cover the entire div */
  background-repeat: no-repeat;  /* Ensure the image doesn't repeat */
  background-size: 150%;  /* Scale the background image to cover */
  box-shadow: inset 0 0 0 50vw rgba(0, 0, 0, 0.6);  /* Adding a shadow effect to create a dark overlay */
}
</style>