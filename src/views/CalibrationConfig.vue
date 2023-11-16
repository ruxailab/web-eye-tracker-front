<template>
    <div>
        <Toolbar />
        <GeneralConfigCard />
    </div>
</template>
  
<script>
import Toolbar from "@/components/general/Toolbar.vue";
import GeneralConfigCard from "../components/calibration/GeneralConfigCard.vue";

export default {
    components: {
        Toolbar,
        GeneralConfigCard
    },
};
</script>