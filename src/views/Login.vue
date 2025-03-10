<template>
  <div style="height:100%">
    <toolbar />
    <v-row justify="center" align="center" style="height:90%">
      <v-col cols="12" lg="6" md="6">
        <v-card outlined class="py-12">
          <h2 class="text-center">Login</h2>
          <p class="text-center pt-6">
            Login with Google to start creating your usability tests
          </p>
          <v-row justify="center" class="mt-12">
            <v-btn id="login-btn-google" large tile class="rounded-0 ma-0" color="#ffffff" @click="login">
              <v-img height="35px" width="35px" class="signin-icon" src="@/assets/iconGoogle.svg"
                alt="Google sign in - icon">
              </v-img>
              <p class="pl-1 pr-1 ma-0 text-center text-capitalize">
                Sign in with Google
              </p>
            </v-btn>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Toolbar from "@/components/general/Toolbar.vue";

export default {
  name: "UserLogin",
  components: {
    Toolbar,
  },
  methods: {
    async login() {
      await this.$store.dispatch("signinwithgoogle");
      this.$router.push("/dashboard");
    },
  },
};
</script>
