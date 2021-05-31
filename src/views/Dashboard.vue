<template>
  <div>
    <toolbar />
    <v-row justify="center" class="mt-12">
      <v-col cols="12" lg="8" md="8">
        <sessions-table :data="sessions" />
      </v-col>
    </v-row>

    <!-- New Session Btn -->
    <v-tooltip left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          dark
          bottom
          right
          fab
          fixed
          v-bind="attrs"
          v-on="on"
          :to="`/sessions/new`"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <span>New Session</span>
    </v-tooltip>
  </div>
</template>

<script>
import Toolbar from "@/components/Toolbar.vue";
import SessionsTable from "@/components/SessionsTable.vue";

export default {
  components: {
    Toolbar,
    SessionsTable,
  },
  data() {
    return {
      sessions: [
        {
          id: "001",
          title: "Session 1",
          desc: "Session Lorem Ipsum",
          created: new Date().toDateString(),
        },
        {
          id: "002",
          title: "Session 2",
          desc: "Session Lorem Ipsum",
          created: new Date().toDateString(),
        },
        {
          id: "003",
          title: "Session 3",
          desc: "Session Lorem Ipsum",
          created: new Date().toDateString(),
        },
        {
          id: "004",
          title: "Session 4",
          desc: "Session Lorem Ipsum",
          created: new Date().toDateString(),
        },
        {
          id: "005",
          title: "Session 5",
          desc: "Session Lorem Ipsum",
          created: new Date().toDateString(),
        },
        {
          id: "006",
          title: "Session 6",
          desc: "Session Lorem Ipsum",
          created: new Date().toDateString(),
        },
      ],
    };
  },
};
</script>
