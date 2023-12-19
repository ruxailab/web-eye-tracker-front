<template>
  <div>
    <toolbar />
    <v-row justify="center" class="mt-12">
      <v-col cols="12" lg="8" md="8">
        <CalibTable />
      </v-col>
    </v-row>
    <DraggableFloatingButton :color="'black'" :icon="'mdi-plus'" @click="goToClibration" />
  </div>
</template>

<script>
import Toolbar from "@/components/general/Toolbar.vue";
import CalibTable from "@/components/general/CalibTable.vue";
import DraggableFloatingButton from '@/components/general/DraggableFloatingButton.vue';

export default {
  components: {
    Toolbar,
    CalibTable,
    DraggableFloatingButton,
  },
  methods: {
    goToClibration() {
      this.$store.commit('resetAll')
      this.$router.push("/calibration");
    },
  }
};
</script>
