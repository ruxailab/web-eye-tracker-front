<template>
  <div>
    <toolbar />
    {{$store.state.auth.user}}
    <h1>Dashboard</h1>
  </div>
</template>

<script>
import Toolbar from "@/components/Toolbar.vue";

export default {
  components: {
    Toolbar,
  },
};
</script>
