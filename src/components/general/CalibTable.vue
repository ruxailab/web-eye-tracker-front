<template>
  <v-card outlined class="pa-4">
    <v-card-title>
      All Calibrations
      <v-spacer></v-spacer>
      <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details outlined
        dense></v-text-field>
    </v-card-title>
    <v-data-table :headers="headers" :items="filteredCalibrations">
      <template v-slot:item="{ item }">
        <tr>
          <td @click="select(item)" v-for="(header, index) in headers" :key="index">
            {{ item[header.value] }}
          </td>
          <td>
            <v-btn icon color="black" @click="deleteItem(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  // Data function defines local component data like search term and table headers
  data() {
    return {
      search: "", // Search term for filtering the list
      // Table headers for displaying in the calibration list
      headers: [
        { text: 'Name', value: 'calibName' },
        { text: 'Id', value: 'id' },
        { text: 'Point Number', value: 'pointNumber' },
        { text: 'Model', value: 'model' },
        { text: 'Average Accuracy', value: 'averageAccuracy' },
        { text: 'Average Precision', value: 'averagePrecision' },
      ],
    };
  },
  // Computed properties to derive values dynamically
  computed: {
    // 'calibrations' retrieves the list of calibrations from the Vuex store
    calibrations() {
      return this.$store.state.calibration.calibrations
    },
    // 'filteredCalibrations' filters the list of calibrations based on the search term
    filteredCalibrations() {
      return this.calibrations.filter(calibration =>
        Object.values(calibration).some(value =>
          value.toLowerCase().includes(this.search.toLowerCase()) // Case-insensitive search
        )
      );
    },
  },
  // Created lifecycle hook triggers when the component is created
  async created() {
    // If no calibrations are available, fetch them and calculate averages
    if (this.calibrations.length == 0) {
      await this.getAllCalibrations() // Fetch calibrations from the store
      await this.calibrations.forEach(element => {
        console.log(element);
        // Calculate and assign average precision and accuracy for each calibration
        element.precision = this.getCalibAvgPrecision(element)
        element.accuracy = this.getCalibAvgAccuracy(element)
      })
    }
  },
  // Methods section for defining functions to manipulate or interact with data
  methods: {
    // 'getCalibAvgAccuracy' calculates the average accuracy for a given calibration
    getCalibAvgAccuracy(calibration) {
      const pattern = calibration.pattern;
      let totalAccuracy = 0;
      pattern.forEach(element => {
        totalAccuracy += Number(element.accuracy); // Add accuracy for each pattern element
      });

      const avgAccuracy = totalAccuracy / pattern.length; // Calculate average
      return avgAccuracy;
    },
    // 'getCalibAvgPrecision' calculates the average precision for a given calibration
    getCalibAvgPrecision(calibration) {
      const pattern = calibration.pattern;
      let totalPrecision = 0;

      pattern.forEach(element => {
        totalPrecision += Number(element.precision); // Add precision for each pattern element
      });

      const avgPrecision = totalPrecision / pattern.length; // Calculate average
      return avgPrecision;
    },
    // 'select' dispatches the selected calibration to the store
    select(item) {
      this.$store.commit('setFromDashboard', true) // Mark that the calibration was selected from the dashboard
      this.$store.dispatch('selectCalib', item) // Dispatch action to select the calibration
    },
    // 'getAllCalibrations' dispatches the action to fetch all calibrations
    getAllCalibrations() {
      this.$store.dispatch('getAllCalibs')
    },
    // 'deleteItem' dispatches the action to delete a calibration
    deleteItem(calib) {
      this.$store.dispatch('deleteCalib', calib) // Dispatch action to delete the calibration
    }
  }
};
</script>
