<template>
    <div>
        <Toolbar />
        <GeneralConfigCard />
    </div>
</template>
  
<script>
import Toolbar from "@/components/Toolbar.vue";
import GeneralConfigCard from "../components/calibConfig/GeneralConfigCard.vue";

export default {
    components: {
        Toolbar,
        GeneralConfigCard
    },
};
</script>