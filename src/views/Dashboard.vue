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
          :to="`/callibration`"
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
    return {}
  },
  computed: {
    sessions() {
      return this.$store.state.session.sessions ?? []
    }
  },
  created() {
    this.$store.dispatch('getUserSessions', this.$store.state.auth.user.uid)
  }
};
</script>
