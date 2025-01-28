<!--
This Vue component represents the Calibration Configuration view.
It includes a toolbar, two configuration cards (GeneralConfigCard and MiscConfigCard),
and a draggable floating button for saving changes.

Components:
    - Toolbar: A general toolbar component.
    - GeneralConfigCard: A card component for general calibration settings.
    - MiscConfigCard: A card component for miscellaneous calibration settings.
    - DraggableFloatingButton: A floating button component that can be dragged around the screen.
    
Methods:
    - changePage: Navigates to the camera calibration page when the floating button is clicked.
Usage:
    This component is used to configure various calibration settings and save them using the floating button.

-->
<template>
    <div>
        <Toolbar />
        <v-container>
            <v-row justify="center" align="start">
                <v-col cols="6">
                    <GeneralConfigCard />
                </v-col>
                <v-col cols="6">
                    <MiscConfigCard />
                </v-col>
            </v-row>
        </v-container>

        <DraggableFloatingButton :icon="'mdi-content-save'" @click="changePage" />
        <!-- <v-btn color="green darken-2" fab bottom right absolute
            :style="{ 'z-index': 10, 'elevation': '12', 'bottom': '20px', 'right': '20px' }" @click="changePage">
            <v-icon color="white">
                mdi-content-save
            </v-icon>
        </v-btn> -->
    </div>
</template>
  
<script>
import Toolbar from "@/components/general/Toolbar.vue";
import GeneralConfigCard from "@/components/calibration/GeneralConfigCard.vue";
import MiscConfigCard from "@/components/calibration/MiscConfigCard.vue";
import DraggableFloatingButton from '@/components/general/DraggableFloatingButton.vue';


export default {
    components: {
        Toolbar,
        GeneralConfigCard,
        MiscConfigCard,
        DraggableFloatingButton
    },
    methods: {
        changePage() {
            this.$router.push("/calibration/camera");
        }
    }
};
</script>