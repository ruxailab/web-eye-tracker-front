<template>
  <div>
    <!-- Toolbar at the top for general navigation or branding -->
    <toolbar />
    <v-row justify="center" class="mt-12">
      <v-col cols="12" lg="8" md="8">
        <!-- Displays the calibration table in the center -->
        <CalibTable />
      </v-col>
    </v-row>
    <!-- Floating action button for navigating to calibration -->
    <DraggableFloatingButton :color="'black'" :icon="'mdi-plus'" @click="goToClibration" />
  </div>
</template>

<script>
import Toolbar from "@/components/general/Toolbar.vue"; // Top toolbar for navigation
import CalibTable from "@/components/general/CalibTable.vue"; // Component for displaying calibration data
import DraggableFloatingButton from '@/components/general/DraggableFloatingButton.vue'; // Floating button with drag functionality

export default {
  components: {
    Toolbar, // Toolbar at the top
    CalibTable, // Table for calibration data
    DraggableFloatingButton, // Floating action button
  },
  methods: {
    // Navigates to the calibration page after resetting all Vuex states
    goToClibration() {
      this.$store.commit('resetAll'); // Resets Vuex store states
      this.$router.push("/calibration"); // Redirects to the calibration page
    },
  }
};
</script>