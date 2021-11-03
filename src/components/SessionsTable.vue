<template>
  <v-card outlined class="pa-4">
    <v-card-title>
      My Sessions
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
    <v-data-table
      :headers="headers"
      :items="data"
      :search="search"
      :loading="loading"
      loading-text="Loading... Please wait"
    >
      <template v-slot:item.created_date="{ item }">
        {{ parseDate(item.created_date) }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon :to="`/sessions/view/${item.id}`">
          <v-icon>mdi-file-eye</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  props: ["data", "loading"],
  data() {
    return {
      search: "",
      headers: [
        {
          text: "Created",
          align: "start",
          sortable: true,
          value: "created_date",
        },
        { text: "Title", value: "title", sortable: true },
        { text: "", value: "actions", align: "end" },
      ],
    };
  },
  methods: {
    parseDate(created_date) {
      return new Date(parseInt(created_date) * 1000)
        .toString()
        .substring(0, 24);
    },
  },
};
</script>
