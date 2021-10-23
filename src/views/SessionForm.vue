<template>
  <div>
    <toolbar />
    <v-row justify="center" class="mt-12">
      <v-col cols="12" lg="8" md="8">
        <v-row align="center">
          <v-col cols="12" lg="7" md="7">
            <h2 class="mb-4">New Session</h2>
            <v-text-field outlined dense placeholder="Title" label="Title" />
            <v-text-field outlined dense placeholder="URL" label="URL" />
            <v-textarea
              outlined
              placeholder="Description"
              label="Description"
            />
            <v-row justify="end" class="ma-0">
              <v-btn outlined color="red" class="mr-6" to="/sessions">cancel</v-btn>
              <v-btn color="success" to="/session-record">start</v-btn>
            </v-row>
          </v-col>
          <v-col cols="12" lg="5" md="5">
            <v-card height="100%" outlined>
              <v-card-title>
                <v-icon left>mdi-information</v-icon>
                How to do it
              </v-card-title>
              <p class="mx-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                sed felis at dolor hendrerit cursus. <br /><br />Lorem ipsum
                dolor sit amet, consectetur adipiscing elit. Nunc sed felis at
                dolor hendrerit cursus. <br /><br />Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Nunc sed felis at dolor hendrerit
                cursus.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Toolbar from "@/components/Toolbar";

export default {
  components: {
    Toolbar,
  },
};
</script>
