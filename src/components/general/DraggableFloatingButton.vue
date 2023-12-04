<template>
    <div>
      <v-btn
        v-if="showButton"
        class="draggable-btn"
        fab
        dark
        :color="color"
        ref="draggableBtn"
        @mousedown="startDrag"
        @mouseup="endDrag"
        @click="handleClick"
      >
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      color: {
        type: String,
        default: 'green'
      },
      icon: {
        type: String,
        default: 'mdi-cursor-move',
      },
    },
    data() {
      return {
        dragging: false,
        showButton: true,
        initialMouseX: 0,
        initialMouseY: 0,
        initialBtnX: 0,
        initialBtnY: 0,
      };
    },
    methods: {
      startDrag(event) {
        this.dragging = true;
        this.initialMouseX = event.clientX;
        this.initialMouseY = event.clientY;
        const rect = this.$refs.draggableBtn.$el.getBoundingClientRect();
        this.initialBtnX = rect.left;
        this.initialBtnY = rect.top;
  
        window.addEventListener("mousemove", this.handleDrag);
        window.addEventListener("mouseup", this.stopDrag);
      },
      handleDrag(event) {
        if (this.dragging) {
          const deltaX = event.clientX - this.initialMouseX;
          const deltaY = event.clientY - this.initialMouseY;
          this.$refs.draggableBtn.$el.style.left = this.initialBtnX + deltaX + "px";
          this.$refs.draggableBtn.$el.style.top = this.initialBtnY + deltaY + "px";
        }
      },
      stopDrag() {
        this.dragging = false;
        window.removeEventListener("mousemove", this.handleDrag);
        window.removeEventListener("mouseup", this.stopDrag);
      },
      handleClick(event) {
        if (!this.dragging) {
          // Handle the click action here
          this.$emit('click', event);
        }
      },
      endDrag() {
        // Delay the clearing of dragging to distinguish between click and drag
        setTimeout(() => {
          this.dragging = false;
        }, 100); // Adjust the delay time as needed
      },
    },
  };
  </script>
  
  <style>
  .draggable-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    cursor: move;
  }
  </style>
  