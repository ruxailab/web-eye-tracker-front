<template>
  <div>
    <toolbar />
    <v-row justify="center" class="mt-12">
      <v-col cols="12" lg="8" md="8">
        <CalibTable />
      </v-col>
    </v-row>

    <!-- New Calibration Btn -->
    <v-tooltip left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn dark bottom right fab fixed v-bind="attrs" v-on="on" :to="`/calibration`">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <span>New Calibration</span>
    </v-tooltip>
  </div>
</template>

<script>
import Toolbar from "@/components/general/Toolbar.vue";
import CalibTable from "@/components/general/CalibTable.vue";

export default {
  components: {
    Toolbar,
    CalibTable,
  },
};
</script>
