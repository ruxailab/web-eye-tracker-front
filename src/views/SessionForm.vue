<template>
  <div>
    <toolbar />
    <v-row justify="center" class="mt-12">
      <v-col cols="12" lg="8" md="8">
        <v-row align="center">
          <v-col cols="12" lg="7" md="7">
            <h2 class="mb-4">New Session</h2>
            <v-form ref="form" lazy-validation v-model="isFormValid">
              <v-text-field v-model="title" outlined dense placeholder="Title" label="Title" :rules="rules.required" />
              <v-text-field v-model="website_url" outlined dense placeholder="URL" label="URL" :rules="rules.required" />
              <v-textarea v-model="description" outlined placeholder="Description" label="Description"
                :rules="rules.required" />
              <v-row justify="end" class="ma-0">
                <v-btn outlined color="red" class="mr-6" to="/sessions">cancel</v-btn>
                <v-btn color="success" @click="setCurrentSession()" :disabled="!isFormValid">start</v-btn>
              </v-row>
            </v-form>
          </v-col>
          <v-col cols="12" lg="5" md="5">
            <v-card height="100%" outlined>
              <v-card-title>
                <v-icon left>mdi-information</v-icon>
                How to do it
              </v-card-title>
              <p class="mx-4">
                Is it your first time doing this? No problem!
                <br /><br />
                This form is the start point of a new eye tracking session. Fill
                up with information about your session, give it a good title,
                the URL of the website you will be analysing and describe your
                testing environment or participant.
                <br /><br />
                Feel free to use the description the way you want, but make sure
                that the URL you provide can be accessed by any website using
                iframes.
                <br /><br />
                In the next step whenever you are ready to start the experiment
                just press the PLAY button. If you want to take a break, press
                PAUSE, and if you finished you can press STOP.
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Toolbar from "@/components/general/Toolbar.vue";

export default {
  components: {
    Toolbar,
  },
  data() {
    return {
      title: "",
      description: "",
      website_url: "",
      rules: {
        required: [(v) => !!v || "Field is required!"],
      },
      isFormValid: true,
    };
  },
  methods: {
    setCurrentSession() {
      if (this.$refs.form.validate()) {
        this.$store.commit("setCurrentSession", {
          title: this.title,
          description: this.description,
          website_url: this.website_url,
          user_id: this.$store.state.auth.user.uid,
          calib_points: this.$store.state.session.currentCalibPoints,
        });

        this.$router.push("/session-record");
      }
    },
  },
};
</script>
