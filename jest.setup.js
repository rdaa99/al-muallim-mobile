// Jest setup file
// Mock Audio for React Native
global.Audio = class Audio {
  constructor(src) {
    this.src = src;
    this.loop = false;
    this.currentTime = 0;
    this.duration = 0;
    this.paused = true;
    this._eventListeners = {};
  }

  addEventListener(type, listener) {
    if (!this._eventListeners[type]) {
      this._eventListeners[type] = [];
    }
    this._eventListeners[type].push(listener);
  }

  removeEventListener(type, listener) {
    if (this._eventListeners[type]) {
      const index = this._eventListeners[type].indexOf(listener);
      if (index > -1) {
        this._eventListeners[type].splice(index, 1);
      }
    }
  }

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }
};
