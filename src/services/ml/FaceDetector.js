class FaceDetector {
  constructor(model) {
    this.model = model;
  }

  /**
   * Estimates the face landmarks from a given video element.
   * Includes defensive checking for video readiness.
   * 
   * @param {HTMLVideoElement} videoElement The video element to analyze
   * @returns {Promise<Array>} The prediction array from TensorFlow
   */
  async detectFace(videoElement) {
    if (!this.model) {
      throw new Error("TensorFlow Face Landmarks Model not loaded.");
    }

    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      console.warn('FaceDetector: Video not ready or has 0 dimensions.');
      // Return null rather than hanging or looping internally, letting the caller retry
      return null;
    }

    try {
      const predictions = await this.model.estimateFaces({
        input: videoElement,
      });
      return predictions;
    } catch (error) {
      console.error("FaceDetector: Error estimating faces", error);
      return null;
    }
  }

  /**
   * Helper utility to safely extract exact iris and eyelid data
   * and detect blinks.
   * 
   * @param {Object} prediction A single face prediction object from the model
   * @param {Number} leftEyeThreshold 
   * @param {Number} rightEyeThreshold 
   * @returns {Object|null} Formatted prediction data or null if invalid/blinking
   */
  processPrediction(prediction, leftEyeThreshold, rightEyeThreshold) {
    if (!prediction || !prediction.annotations || !prediction.annotations.leftEyeIris || !prediction.annotations.rightEyeIris) {
      return null;
    }

    const annotations = prediction.annotations;

    // left eye
    const leftIris = annotations.leftEyeIris;
    const leftEyelid = annotations.leftEyeUpper0.concat(annotations.leftEyeLower0);
    const leftEyelidTip = leftEyelid[3];
    const leftEyelidBottom = leftEyelid[11];
    const leftDistance = this._calculateDistance(leftEyelidTip, leftEyelidBottom);
    const isLeftBlink = leftDistance < leftEyeThreshold;

    // right eye
    const rightIris = annotations.rightEyeIris;
    const rightEyelid = annotations.rightEyeUpper0.concat(annotations.rightEyeLower0);
    const rightEyelidTip = rightEyelid[3];
    const rightEyelidBottom = rightEyelid[11];
    const rightDistance = this._calculateDistance(rightEyelidTip, rightEyelidBottom);
    const isRightBlink = rightDistance < rightEyeThreshold;

    if (isLeftBlink || isRightBlink) {
      return { isBlinking: true };
    }

    return {
      isBlinking: false,
      leftIris: leftIris[0],
      rightIris: rightIris[0]
    };
  }

  _calculateDistance(point1, point2) {
    const xDistance = point2[0] - point1[0];
    const yDistance = point2[1] - point1[1];
    return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
  }
}

export default FaceDetector;
