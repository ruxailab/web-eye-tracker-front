<template>
    <div>
        <Toolbar />
        <v-row justify="center" align="center">
            <v-col cols="6">
                <GeneralConfigCard />
            </v-col>
            <v-col cols="6">
                <GeneralConfigCard />
            </v-col>
        </v-row>

        <v-btn color="green darken-2" fab bottom right absolute
            :style="{ 'z-index': 10, 'elevation': '12', 'bottom': '20px', 'right': '20px' }" @click="changePage">
            <v-icon color="white">
                mdi-content-save
            </v-icon>
        </v-btn>
    </div>
</template>
  
<script>
import Toolbar from "@/components/general/Toolbar.vue";
import GeneralConfigCard from "@/components/calibration/GeneralConfigCard.vue";

export default {
    components: {
        Toolbar,
        GeneralConfigCard,
    },
    methods: {
        changePage() {
            this.$router.push("/callibration/camera");
        }
    }
};
</script>