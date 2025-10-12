/**
 * Fish Behavior Configuration
 * 
 * Centralized configuration for fish swimming behaviors.
 * Modify these settings to change how fish behave in the aquarium.
 */

export const fishBehaviorConfig = {
  /**
   * HOVER BEHAVIOR
   * Controls what happens when user hovers over a fish
   */
  hover: {
    // Should fish pause when mouse hovers over them?
    pauseOnHover: true,
    
    // Should fish show a glow effect on hover?
    glowOnHover: true,
    
    // Should fish scale up on hover? (set to false for better performance)
    scaleOnHover: false,
    
    // Glow color (CSS color value)
    glowColor: 'rgba(102, 126, 234, 0.6)',
    
    // Scale amount if scaleOnHover is true
    hoverScale: 1.15
  },

  /**
   * SWIMMING BEHAVIOR
   * Controls how fish move around the aquarium
   */
  swimming: {
    // Turn around at edges? (false = wrap around to opposite side)
    turnAroundAtEdges: true,
    
    // Edge boundaries (percentage of aquarium width)
    leftEdge: 5,   // Fish turns around at 5%
    rightEdge: 85, // Fish turns around at 85%
    
    // Vertical bobbing (wavy swimming)
    enableBobbing: true,
    bobbingAmount: 3,    // Max pixels to bob up/down
    bobbingSpeed: 2,     // Oscillation speed
    
    // Speed variation
    enableSpeedVariation: true,
    speedVariationMin: 0.8,  // 80% of base speed
    speedVariationMax: 1.2,  // 120% of base speed
    
    // Y-axis bounds (percentage of aquarium height)
    minY: 15,  // Don't swim above 15%
    maxY: 65   // Don't swim below 65%
  },

  /**
   * CLICK BEHAVIOR
   * What happens when fish is clicked
   */
  click: {
    // Emit event for parent component to handle
    emitClickEvent: true,
    
    // Future: Add click effects here
    // flashOnClick: true,
    // playSound: false,
    // showParticles: false
  },

  /**
   * VISUAL EFFECTS
   * Fish appearance and animations
   */
  visual: {
    // Shadow/drop-shadow effects
    enableShadow: true,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    
    // Breathing animation
    enableBreathing: true,
    breathingDuration: 2, // seconds
    breathingScale: 1.05, // Max scale during breathing
    
    // Direction flip transition speed
    flipTransitionSpeed: 0.5 // seconds
  },

  /**
   * PERFORMANCE
   * Settings that affect rendering performance
   */
  performance: {
    // Use requestAnimationFrame (recommended: true)
    useRAF: true,
    
    // Enable GPU acceleration
    useGPUAcceleration: true,
    
    // Reduce animation quality on low-end devices (future feature)
    adaptiveQuality: false
  },

  /**
   * FUTURE FEATURES (currently not implemented)
   * Uncomment and implement as needed
   */
  future: {
    // Pause behavior
    // pauseOnRandomIntervals: false,
    // pauseDuration: 2000, // milliseconds
    // pauseChance: 0.001, // 0.1% chance per frame
    
    // Mouse interaction
    // swimAwayFromMouse: false,
    // swimAwayDistance: 100, // pixels
    
    // Schooling
    // enableSchooling: false,
    // schoolingDistance: 150,
    
    // Depth changes
    // changeLayersRandomly: false,
    // layerChangeChance: 0.0005
  }
}

/**
 * HELPER FUNCTIONS
 * Convenience functions for accessing config
 */

export function shouldPauseOnHover() {
  return fishBehaviorConfig.hover.pauseOnHover
}

export function shouldTurnAroundAtEdges() {
  return fishBehaviorConfig.swimming.turnAroundAtEdges
}

export function getEdgeBoundaries() {
  return {
    left: fishBehaviorConfig.swimming.leftEdge,
    right: fishBehaviorConfig.swimming.rightEdge
  }
}

export function getBobbingSettings() {
  return {
    enabled: fishBehaviorConfig.swimming.enableBobbing,
    amount: fishBehaviorConfig.swimming.bobbingAmount,
    speed: fishBehaviorConfig.swimming.bobbingSpeed
  }
}

export function getYBounds() {
  return {
    min: fishBehaviorConfig.swimming.minY,
    max: fishBehaviorConfig.swimming.maxY
  }
}

/**
 * EXPORT DEFAULT
 */
export default fishBehaviorConfig
