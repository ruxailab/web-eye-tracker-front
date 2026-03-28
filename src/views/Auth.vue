<template>
  <div style="height: 100%">
    <toolbar />
    <v-row justify="center" align="center" style="height: 90%">
      <v-col cols="12" lg="6" md="7">
        <v-card outlined class="py-12 px-6">
          <h2 class="text-center">{{ isSignup ? 'Sign Up' : 'Login' }}</h2>
          <p class="text-center pt-6">
            {{ isSignup ? 'Create your account to start calibration sessions.' : 'Login to continue with your calibration sessions.' }}
          </p>

          <v-alert v-if="errorMessage" type="error" dense outlined class="mt-4 mb-0">
            {{ errorMessage }}
          </v-alert>

          <v-text-field
            id="auth-email"
            v-model="email"
            label="Email"
            type="email"
            autocomplete="email"
            outlined
            dense
            class="mt-6"
            :disabled="loading"
          />

          <v-text-field
            id="auth-password"
            v-model="password"
            label="Password"
            type="password"
            autocomplete="current-password"
            outlined
            dense
            :disabled="loading"
            @keyup.enter="submitAuth"
          />

          <v-btn
            id="auth-submit"
            color="black"
            dark
            block
            :loading="loading"
            :disabled="loading"
            @click="submitAuth"
          >
            {{ isSignup ? 'Sign up' : 'Login' }}
          </v-btn>

          <v-row justify="center" class="mt-6">
            <v-btn
              id="login-btn-google"
              large
              tile
              class="rounded-0 ma-0"
              color="#ffffff"
              :disabled="loading"
              @click="loginWithGoogle"
            >
              <v-img
                height="35px"
                width="35px"
                class="signin-icon"
                src="@/assets/iconGoogle.svg"
                alt="Google sign in - icon"
              />
              <span class="pl-1 pr-1 ma-0 text-center text-capitalize">Sign in with Google</span>
            </v-btn>
          </v-row>

          <p class="text-center mt-6 mb-0">
            {{ isSignup ? 'Already have an account?' : "Don't have an account?" }}
            <button class="toggle-btn" type="button" :disabled="loading" @click="toggleMode">
              {{ isSignup ? 'Login' : 'Sign up' }}
            </button>
          </p>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Toolbar from '@/components/general/Toolbar.vue'
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from '@/services/firebaseAuth'

export default {
  components: {
    Toolbar,
  },
  data() {
    return {
      email: '',
      password: '',
      isSignup: false,
      loading: false,
      errorMessage: '',
    }
  },
  methods: {
    toggleMode() {
      this.isSignup = !this.isSignup
      this.errorMessage = ''
    },
    validateForm() {
      if (!this.email || !this.password) {
        this.errorMessage = 'Please enter both email and password.'
        return false
      }

      if (this.password.length < 6) {
        this.errorMessage = 'Password must be at least 6 characters long.'
        return false
      }

      return true
    },
    async submitAuth() {
      this.errorMessage = ''

      if (!this.validateForm()) {
        return
      }

      this.loading = true

      try {
        const normalizedEmail = this.email.trim()

        if (this.isSignup) {
          await signUpWithEmail(normalizedEmail, this.password)
        } else {
          await signInWithEmail(normalizedEmail, this.password)
        }

        this.$router.push('/dashboard')
      } catch (error) {
        this.errorMessage = error.message || 'Authentication failed. Please try again.'
      } finally {
        this.loading = false
      }
    },
    async loginWithGoogle() {
      this.errorMessage = ''
      this.loading = true

      try {
        await signInWithGoogle()
        this.$router.push('/dashboard')
      } catch (error) {
        this.errorMessage = error.message || 'Google sign-in failed. Please try again.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.toggle-btn {
  background: transparent;
  border: 0;
  color: #1976d2;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
}

.toggle-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
