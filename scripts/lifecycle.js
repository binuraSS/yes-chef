export const appLifecycle = {
    mounted() {
      window.addEventListener('keydown', this.handleKeyDown);
    },
    beforeDestroy() {
      window.removeEventListener('keydown', this.handleKeyDown);
      this.resetTimer();
    }
  };
  