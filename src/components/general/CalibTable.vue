<template>
  <v-card outlined class="pa-4">
    <v-card-title>
      My Calibrations
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
        outlined
        dense
      ></v-text-field>
    </v-card-title>
  </v-card>
</template>

<script>
export default {
  data() {
    return {
      search: "",
    };
  },
};
</script>
