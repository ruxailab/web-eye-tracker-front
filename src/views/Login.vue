<template>
  <div style="height: 100%">
    <toolbar />
    <v-row justify="center" align="center" style="height: 90%">
      <v-col cols="12" lg="6" md="6">
        <v-card outlined class="py-12 px-6">
          <v-tabs v-model="tab" centered>
            <v-tab>Login</v-tab>
            <v-tab>Signup</v-tab>
          </v-tabs>

          <v-tabs-items v-model="tab">
            <!-- LOGIN TAB -->
            <v-tab-item>
              <h2 class="text-center">Login</h2>
              <p class="text-center pt-6">Login with Google or use Email & Password</p>

              <!-- Google Login -->
              <v-row justify="center" class="mt-6">
                <v-btn id="login-btn-google" large tile class="rounded-0 ma-0" color="#ffffff" @click="loginWithGoogle">
                  <v-img height="35px" width="35px" class="signin-icon" src="@/assets/iconGoogle.svg"
                    alt="Google sign in - icon">
                  </v-img>
                  <p class="pl-1 pr-1 ma-0 text-center text-capitalize">Sign in with Google</p>
                </v-btn>
              </v-row>

              <v-divider class="my-6"></v-divider>

              <!-- Email/Password Login -->
              <v-form ref="loginForm" v-model="validLogin" @submit.prevent="loginWithEmail">
                <v-text-field v-model="email" label="Email" type="email" :rules="[rules.required, rules.email]"
                  outlined></v-text-field>

                <v-text-field v-model="password" label="Password" type="password"
                  :rules="[rules.required, rules.minLength]" outlined></v-text-field>

                <v-btn :disabled="!validLogin" color="primary" block class="mt-3" type="submit">
                  Login with Email
                </v-btn>
              </v-form>
            </v-tab-item>

            <!-- SIGNUP TAB -->
            <v-tab-item>
              <h2 class="text-center">Signup</h2>
              <p class="text-center pt-6">Create an account using Email & Password</p>

              <v-form ref="signupForm" v-model="validSignup" @submit.prevent="signupWithEmail">
                <v-text-field v-model="signupEmail" label="Email" type="email" :rules="[rules.required, rules.email]"
                  outlined></v-text-field>

                <v-text-field v-model="signupPassword" label="Password" type="password"
                  :rules="[rules.required, rules.minLength]" outlined></v-text-field>

                <v-text-field v-model="confirmPassword" label="Confirm Password" type="password"
                  :rules="[rules.required, rules.matchPassword]" outlined></v-text-field>

                <v-btn :disabled="!validSignup" color="success" block class="mt-3" type="submit">
                  Signup
                </v-btn>
              </v-form>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
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
      tab: 0, // 0 = Login, 1 = Signup
      email: "",
      password: "",
      signupEmail: "",
      signupPassword: "",
      confirmPassword: "",
      validLogin: false,
      validSignup: false,
      rules: {
        required: v => !!v || "Field is required",
        email: v => /.+@.+\..+/.test(v) || "Enter a valid email",
        minLength: v => v.length >= 6 || "Password must be at least 6 characters",
        matchPassword: v => v === this.signupPassword || "Passwords must match",
      },
    };
  },
  methods: {
    async loginWithGoogle() {
      try {
        await this.$store.dispatch("signinwithgoogle");
        this.$router.push("/dashboard");
      } catch (error) {
        alert("Google Sign-In Error: " + error.message);
      }
    },
    async loginWithEmail() {
      if (this.$refs.loginForm.validate()) {
        try {
          await this.$store.dispatch("signinwithemail", {
            email: this.email,
            password: this.password,
          });
          this.$router.push("/dashboard");
        } catch (error) {
          alert("Login failed: " + error.message);
        }
      }
    },
    async signupWithEmail() {
      if (this.$refs.signupForm.validate()) {
        try {
          await this.$store.dispatch("signupwithemail", {
            email: this.signupEmail,
            password: this.signupPassword,
          });
          this.$router.push("/dashboard");
        } catch (error) {
          alert("Signup failed: " + error.message);
        }
      }
    },
  },
};
</script>
