<template>
  <canvas id="calibration-canvas" style="z-index: 0;" />
</template>

<script>
export default {
  name: 'CalibrationCanvas',
  props: {
    backgroundColor: {
      type: String,
      default: '#FFFFFFFF'
    },
    pointColor: {
      type: String,
      default: '#000000FF'
    },
    radius: {
      type: Number,
      required: true
    },
    innerCircleRadius: {
      type: Number,
      default: 5
    },
    animationFrames: {
      type: Number,
      default: 250
    },
    animationRefreshRate: {
      type: Number,
      default: 10
    }
  },
  mounted() {
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCanvas);
  },
  methods: {
    resizeCanvas() {
      const canvas = document.getElementById('calibration-canvas');
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    },
    clearCanvas() {
      const canvas = document.getElementById('calibration-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    drawPoint(x, y, currentRadius) {
      const canvas = document.getElementById('calibration-canvas');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Fill background
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw main circle 
      ctx.beginPath();
      ctx.strokeStyle = this.pointColor;
      ctx.fillStyle = this.pointColor;
      ctx.arc(x, y, currentRadius, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.fill();
      
      // Draw inner red dot
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.fillStyle = "red";
      ctx.arc(x, y, this.innerCircleRadius, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.fill();
      
      // Draw hollow circumference representing maximum radius
      ctx.strokeStyle = this.pointColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, this.radius, 0, 2 * Math.PI, false);
      ctx.stroke();
    },
    async triggerAnimation(origin, target) {
      const frames = this.animationFrames;
      const deltaX = (target.x - origin.x) / frames;
      const deltaY = (target.y - origin.y) / frames;

      for (let d = 1; d <= frames; d++) {
        const xPosition = origin.x + deltaX * d;
        const yPosition = origin.y + deltaY * d;
        
        if (d === frames) {
          this.drawPoint(xPosition, yPosition, 1);
        } else {
          // Shrink radius as it moves
          const currentRadius = (this.radius / frames) * (frames - d);
          this.drawPoint(xPosition, yPosition, currentRadius);
        }
        await new Promise(resolve => setTimeout(resolve, this.animationRefreshRate));
      }
    }
  }
};
</script>

<style scoped>
#calibration-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none; /* Let clicks pass through to UI underneath if needed */
}
</style>
