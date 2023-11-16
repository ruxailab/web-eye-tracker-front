<template>
  <div>
    <toolbar />
    <v-row justify="center" class="mt-12">
      <v-col cols="12" lg="8" md="8">
        <sessions-table :data="sessions" :loading="loading" />
      </v-col>
    </v-row>

    <!-- New Session Btn -->
    <v-tooltip left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn dark bottom right fab fixed v-bind="attrs" v-on="on" :to="`/callibration`">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <span>New Session</span>
    </v-tooltip>
  </div>
</template>

<script>
import Toolbar from "@/components/general/Toolbar.vue";
import SessionsTable from "@/components/general/SessionsTable.vue";

export default {
  components: {
    Toolbar,
    SessionsTable,
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    sessions() {
      return this.$store.state.session.sessions ?? []
    }
  },
  async created() {
    this.loading = true
    await this.$store.dispatch('getUserSessions', this.$store.state.auth.user.uid)
    this.loading = false
  }
};
</script>
