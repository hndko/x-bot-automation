// Simple beep sounds for notifications
// Using Web Audio API to generate tones

class SoundGenerator {
  constructor() {
    this.audioContext = null;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  beep(frequency = 440, duration = 200, type = 'success') {
    this.init();
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Different tones for different types
    if (type === 'success') {
      oscillator.frequency.value = 800; // Higher pitch
      gainNode.gain.value = 0.3;
    } else if (type === 'error') {
      oscillator.frequency.value = 200; // Lower pitch
      gainNode.gain.value = 0.4;
    } else if (type === 'complete') {
      oscillator.frequency.value = 1000; // Highest pitch
      gainNode.gain.value = 0.3;
    }
    
    oscillator.type = 'sine';
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
    
    // Fade out
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration / 1000
    );
  }
}

const soundGen = new SoundGenerator();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = soundGen;
}
