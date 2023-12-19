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
  data() {
    return {
      search: "",
      headers: [
        { text: 'name', value: 'calibName' },
        { text: 'id', value: 'id' },
        { text: 'point number', value: 'pointNumber' },
        { text: 'average accuracy', value: 'averageAccuracy' },
        { text: 'average precision', value: 'averagePrecision' },
      ],
    };
  },
  computed: {
    calibrations() {
      return this.$store.state.calibration.calibrations
    },
    filteredCalibrations() {
      return this.calibrations.filter(calibration =>
        Object.values(calibration).some(value =>
          value.toLowerCase().includes(this.search.toLowerCase())
        )
      );
    },
  },
  async created() {
    if (this.calibrations.length == 0) {
      await this.getAllCalibrations()
      await this.calibrations.forEach(element => {
        console.log(element);
        element.precision = this.getCalibAvgPrecision(element)
        element.accuracy = this.getCalibAvgAccuracy(element)
      }
      )
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
    getAllCalibrations() {
      this.$store.dispatch('getAllCalibs')
    },
    deleteItem(calib) {
      this.$store.dispatch('deleteCalib', calib)
    }
  }
};
</script>
