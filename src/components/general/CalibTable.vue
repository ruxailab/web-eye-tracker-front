<template>
  <v-card outlined class="pa-4">
    <v-card-title>
      All Calibrations
      <v-spacer></v-spacer>
      <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details outlined
        dense></v-text-field>
    </v-card-title>
    <v-data-table :headers="headers" :items="filteredCalibrations" :loading="tableLoading">
      <template v-slot:item="{ item }">
        <tr>
          <td v-for="(header, index) in headers" :key="index">
            {{ formatTableValue(item[header.value]) }}
          </td>
          <td>
            <v-btn icon color="black" @click="select(item)">
              <v-icon>mdi-eye</v-icon>
            </v-btn>
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
  data() {
    return {
      search: "",
      tableLoading: false,
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
  computed: {
    calibrations() {
      return this.$store.state.calibration.calibrations
    },
    filteredCalibrations() {
      const searchTerm = this.search.toLowerCase();
      if (!searchTerm) return this.calibrations;
      return this.calibrations.filter(calibration =>
        Object.values(calibration).some(value =>
          String(value).toLowerCase().includes(searchTerm)
        )
      );
    },
  },
  async created() {
    if (this.calibrations.length === 0) {
      await this.getAllCalibrations();
    }
  },
  methods: {
    getCalibAvgAccuracy(calibration) {
      const pattern = calibration.pattern;
      let totalAccuracy = 0;
      pattern.forEach(element => {
        totalAccuracy += Number(element.accuracy);
      });

      const avgAccuracy = totalAccuracy / pattern.length;
      return avgAccuracy;
    },
    getCalibAvgPrecision(calibration) {
      const pattern = calibration.pattern;
      let totalPrecision = 0;

      pattern.forEach(element => {
        totalPrecision += Number(element.precision);
      });

      const avgPrecision = totalPrecision / pattern.length;
      return avgPrecision;
    },
    select(item) {
      this.$store.commit('setFromDashboard', true)
      this.$store.dispatch('selectCalib', item)
    },
    async getAllCalibrations() {
      this.tableLoading = true;
      try {
        await this.$store.dispatch('getAllCalibs');
      } finally {
        this.tableLoading = false;
      }
    },
    formatTableValue(value) {
      if (value === null || value === undefined) {
        return "";
      }

      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed.toFixed(2);
      }

      return value;
    },
    deleteItem(calib) {
      this.$store.dispatch('deleteCalib', calib)
    }
  }
};
</script>
