<template>
  <div>
    <toolbar />
    <v-row justify="center" class="mt-12">
      <v-col cols="12" lg="8" md="8">
        <v-card outlined class="pa-2">
          <v-row align="center" class="mr-2">
            <v-col cols="12" lg="8" md="8">
              <v-card-title>{{ session.title }}</v-card-title>
              <v-card-subtitle>{{ session.created }}</v-card-subtitle>
              <p class="mx-4">{{ session.desc }}</p>
            </v-col>
            <v-col cols="12" lg="4" md="4">
              <v-btn width="100%" class="my-6" outlined>
                Download JSON
                <v-icon right>mdi-code-json</v-icon>
              </v-btn>
              <v-btn width="100%" outlined>
                Create heatmap
                <v-icon right>mdi-fire</v-icon>
              </v-btn>
              <v-btn width="100%" class="mt-6" outlined color="red">
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
</template>

<script>
import Toolbar from "@/components/Toolbar";

export default {
  components: {
    Toolbar,
  },
  data() {
    return {
      session: null,
    };
  },
  created() {
    // TODO: Fetch from the db the session based on route params id
    this.session = {
      id: "001",
      title: "Session 1",
      desc:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nuncsed felis at dolor hendrerit cursus. Lorem ipsum dolor sit amet,consectetur adipiscing elit. Nunc sed felis at dolor hendreritcursus.Lorem ipsum dolor sit amet, consectetur adipiscingelit. Nunc sed felis at dolor hendrerit cursus. Lorem ipsumdolor sit amet, consectetur adipiscing elit. Nunc sed felis atdolor hendrerit cursus.",
      created: new Date().toDateString(),
    };
  },
};
</script>
