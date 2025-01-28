<template>
  <div>
    <v-btn v-if="showButton" class="draggable-btn" fab dark :color="color" ref="draggableBtn" @mousedown="startDrag">
      <v-icon>{{ icon }}</v-icon>
    </v-btn>
  </div>
</template>
  
<script>
export default {
  // Props passed to the component
  props: {
    // 'color' defines the color of the button, default is 'green'
    color: {
      type: String,
      default: 'green'
    },
    // 'icon' defines the icon to be displayed, default is 'mdi-cursor-move'
    icon: {
      type: String,
      default: 'mdi-cursor-move',
    },
  },
  // Data function contains state variables for drag functionality
  data() {
    return {
      dragging: false, // Indicates whether the button is being dragged
      showButton: true, // Indicates whether the button is visible
      initialMouseX: 0, // Initial mouse X position when drag starts
      initialMouseY: 0, // Initial mouse Y position when drag starts
      initialBtnX: 0, // Initial button X position when drag starts
      initialBtnY: 0, // Initial button Y position when drag starts
      deltaX: 0, // Difference in X position during dragging
      deltaY: 0, // Difference in Y position during dragging
      startTime: 0, // Time when drag started
    };
  },
  // Methods for handling drag and click events
  methods: {
    // Method to initiate drag, triggered by mouse down event
    startDrag(event) {
      this.dragging = true; // Set dragging flag to true
      this.startTime = new Date(); // Record the time drag starts
      this.initialMouseX = event.clientX; // Set initial mouse X position
      this.initialMouseY = event.clientY; // Set initial mouse Y position
      // Get the initial position of the button using its bounding rectangle
      const rect = this.$refs.draggableBtn.$el.getBoundingClientRect();
      this.initialBtnX = rect.left; // Initial X position of the button
      this.initialBtnY = rect.top; // Initial Y position of the button

      // Add event listeners for mouse move and mouse up
      window.addEventListener("mousemove", this.handleDrag);
      window.addEventListener("mouseup", this.endDrag);
    },
    // Method to update the button's position while dragging
    handleDrag(event) {
      if (this.dragging) {
        // Calculate the distance moved by the mouse
        this.deltaX = event.clientX - this.initialMouseX;
        this.deltaY = event.clientY - this.initialMouseY;
        // Set the new position of the button
        this.$refs.draggableBtn.$el.style.left = this.initialBtnX + this.deltaX + "px";
        this.$refs.draggableBtn.$el.style.top = this.initialBtnY + this.deltaY + "px";
      }
    },
    // Method to handle the end of the drag
    endDrag() {
      if (this.dragging) {
        this.dragging = false; // Set dragging flag to false
        // If no movement occurred, treat it as a click
        if (this.deltaX == 0 && this.deltaY == 0) {
          this.handleClick();
        }
        // Reset movement differences
        this.deltaX = 0;
        this.deltaY = 0;
      }
    },
    // Method to handle click events, triggered when the drag ends or button is clicked
    handleClick(event) {
      if (!this.dragging) {
        this.$emit('click', event); // Emit click event to parent component
      }
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
}
</style>
  