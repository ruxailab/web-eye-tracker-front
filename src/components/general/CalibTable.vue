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
  },
  methods: {
    select(item) {
      this.$store.dispatch('selectCalib', item)
    },
    getAllCalibrations() {
      this.$store.dispatch('getAllCalibs')
    },
  }
};
</script>
