<template>
  <v-card outlined class="pa-4">
    <v-card-title>
      My Calibrations
      <v-spacer></v-spacer>
      <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details outlined
        dense></v-text-field>
    </v-card-title>
    <v-data-table :headers="headers" :items="filteredCalibrations">
      <template v-slot:item="{ item }">
        <tr @click="select(item)">
          <td v-for="(header, index) in headers" :key="index">
            {{ item[header.value] }}
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
        { text: 'average accuracy', value: 'accuracy' },
        { text: 'average precision', value: 'precision' },
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
  created() {
    if (this.calibrations.length == 0) {
      this.getAllCalibrations()
    }
    this.calibrations.forEach(element => {
      element.precision = this.getCalibAvgPrecision(element)
      element.accuracy = this.getCalibAvgAccuracy(element)
    }
    )
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
      this.$store.dispatch('selectCalib', item)
    },
    getAllCalibrations() {
      this.$store.dispatch('getAllCalibs')
    },
  }
};
</script>
