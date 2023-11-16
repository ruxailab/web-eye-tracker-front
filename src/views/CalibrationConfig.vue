<template>
    <div>
        <Toolbar />
        <GeneralConfigCard />
        <v-btn color="green darken-2" fab bottom right absolute
            :style="{ 'z-index': 10, 'elevation': '12', 'bottom':'20px','right':'20px'}">
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
};
</script>