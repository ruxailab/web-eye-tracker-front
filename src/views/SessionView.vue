<template>
  <div>
    <toolbar />
    <div v-if="session">
      <v-row justify="center" class="mt-12">
        <v-col cols="12" lg="8" md="8">
          <v-card outlined class="pa-2">
            <v-row align="center" class="mr-2">
              <v-col cols="12" lg="8" md="8">
                <v-card-title>{{ session.title }}</v-card-title>
                <v-card-subtitle>{{
                  parseDate(session.created_date)
                }}</v-card-subtitle>
                <p class="mx-4">{{ session.description }}</p>
              </v-col>
              <v-col cols="12" lg="4" md="4">
                <v-btn
                  width="100%"
                  class="my-6"
                  outlined
                  @click="downloadJSON()"
                >
                  Download JSON
                  <v-icon right>mdi-code-json</v-icon>
                </v-btn>
                <v-btn width="100%" outlined>
                  Create heatmap
                  <v-icon right>mdi-fire</v-icon>
                </v-btn>
                <v-btn
                  width="100%"
                  class="mt-6"
                  outlined
                  color="red"
                  @click="deleteSession()"
                >
                  Delete session
                  <v-icon right>mdi-delete-outline</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!---Return Btn---->
      <v-tooltip right>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            dark
            bottom
            left
            fab
            fixed
            small
            v-bind="attrs"
            v-on="on"
            :to="`/dashboard`"
          >
            <v-icon>mdi-undo</v-icon>
          </v-btn>
        </template>
        <span>Back to sessions</span>
      </v-tooltip>
    </div>
    <v-row justify="center" class="mt-12 pt-12" v-else>
      <v-progress-circular
        :size="50"
        :width="7"
        color="black"
        indeterminate
      ></v-progress-circular>
    </v-row>
  </div>
</template>

<script>
import Toolbar from "@/components/Toolbar";
import api from "@/services/session";

export default {
  components: {
    Toolbar,
  },
  computed: {
    session() {
      return this.$store.state.session.currentSession;
    },
  },
  methods: {
    async downloadJSON() {
      const { data } = (await api.getSessionResults(this.session.id))
      var dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(data));
      var downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", this.session.title + ".json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    parseDate(created_date) {
      return new Date(parseInt(created_date) * 1000)
        .toString()
        .substring(0, 24);
    },
    async deleteSession() {
      await api.deleteSession(this.session.id);
      this.$router.push("/dashboard");
    },
  },
  async created() {
    await this.$store.dispatch("getSessionById", this.$route.params.id);
  },
};
</script>
