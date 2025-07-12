import { getEmoji } from './emojiHelper.js';    
import { scrapeFromUrl } from './recipeScraper.js';

export const appMethods = {
  // ===== VIEW NAVIGATION =====
  selectRecipe(index) {
    if (index >= 0 && index < this.recipes.length) {
      this.recipeIndex = index;
      this.stepIndex = 0;
      this.view = 'ingredients';
      this.checkedIngredients = [];
    }
  },
  goToRecipe() {
    this.view = 'recipe';
    this.resetTimer();
  },
  backToSearch() {
    this.view = 'home';
    this.searchQuery = '';
    this.selectedIngredients = [];
    this.resetTimer();
  },

  // ===== STEP NAVIGATION =====
  nextStep() {
    if (this.stepIndex < (this.currentRecipe.steps || []).length - 1) {
      this.stepIndex++;
      this.resetTimer();
    }
    this.resetSwipe();
  },
  prevStep() {
    if (this.stepIndex > 0) {
      this.stepIndex--;
      this.resetTimer();
    }
    this.resetSwipe();
  },
  goToStep(index) {
    if (index >= 0 && index < (this.currentRecipe.steps || []).length) {
      this.stepIndex = index;
      this.resetTimer();
      this.resetSwipe();
    }
  },

  // ===== CAROUSEL HELPERS =====
  repeatedTitles(row) {
    const offset = (row - 1) * 3;
    return [...this.recipes.slice(offset), ...this.recipes.slice(0, offset)];
  },
  selectRecipeByTitle(title) {
    const index = this.recipes.findIndex(recipe => recipe.title === title);
    if (index !== -1) {
      this.selectRecipe(index);
    }
  },

  // ===== TIMER CONTROLS =====
  startTimer() {
    if (!this.currentStep.timer) return;
    this.timerCount = this.currentStep.timer;
    this.timerRunning = true;
    this.timerPaused = false;
    this.startTimerInterval();
  },
  pauseTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.timerRunning = false;
    this.timerPaused = true;
  },
  resumeTimer() {
    if (this.timerPaused && this.timerCount > 0) {
      this.timerRunning = true;
      this.timerPaused = false;
      this.startTimerInterval();
    }
  },
  resetTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.timerRunning = false;
    this.timerPaused = false;
    this.timerCount = 0;
  },
  startTimerInterval() {
    this.timer = setInterval(() => {
      if (this.timerCount > 0) {
        this.timerCount--;
      } else {
        this.handleTimerComplete();
      }
    }, 1000);
  },
  handleTimerComplete() {
    this.resetTimer();
    this.playBellSound();
    alert("Time's up!");
  },
  playBellSound() {
    const bell = document.getElementById('bellSound');
    if (bell) {
      bell.play().catch(error => {
        console.log('Could not play bell sound:', error);
      });
    }
  },
  formatStepTimer(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  // ===== TOUCH & SWIPE CONTROLS =====
  startTouch(e) {
    if (e.touches && e.touches[0]) {
      this.touchStartY = e.touches[0].clientY;
      this.dragging = true;
    }
  },
  onTouchMove(e) {
    if (e.touches && e.touches[0]) {
      const touchY = e.touches[0].clientY;
      this.currentY = touchY - this.touchStartY;
    }
  },
  endTouch() {
    this.dragging = false;
    const threshold = 100;
    if (this.currentY < -threshold) {
      this.animateSwipe(-window.innerHeight, this.nextStep);
    } else if (this.currentY > threshold) {
      this.animateSwipe(window.innerHeight, this.prevStep);
    } else {
      this.currentY = 0;
    }
  },
  animateSwipe(targetY, callback) {
    const el = this.$el.querySelector('.card');
    if (!el) return;
    el.style.transition = 'transform 0.3s ease';
    el.style.transform = `translateY(${targetY}px)`;
    setTimeout(() => {
      callback();
      el.style.transition = '';
      el.style.transform = '';
      this.currentY = 0;
    }, 300);
  },
  resetSwipe() {
    this.currentY = 0;
  },

  // ===== INGREDIENT SEARCH =====
  addIngredient() {
    const trimmed = this.ingredientQuery.trim().toLowerCase();
    if (trimmed && !this.selectedIngredients.includes(trimmed)) {
      this.selectedIngredients.push(trimmed);
    }
    this.ingredientQuery = '';
  },
  removeIngredient(index) {
    if (index >= 0 && index < this.selectedIngredients.length) {
      this.selectedIngredients.splice(index, 1);
    }
  },

  // ===== KEYBOARD SUPPORT =====
  handleKeyDown(event) {
    if (this.view === 'recipe') {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          this.nextStep();
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.prevStep();
          break;
      }
    }
  },

  // ===== SCRAPER & EMOJI =====
  scrapeFromUrl,
  getEmoji,

 // ===== Shopping List =====
 generateShoppingList() {
  this.shoppingList = this.currentRecipe.ingredients.map(item => ({
    name: item,
    checked: false
  }));
  this.showShoppingList = true;
},

downloadShoppingList() {
  const content = this.shoppingList
    .map(item => `${item.checked ? '[x]' : '[ ]'} ${item.name}`)
    .join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${this.currentRecipe.title || 'shopping-list'}.txt`;
  a.click();
  URL.revokeObjectURL(url);
},


  emailFullRecipe() {
    if (!this.currentRecipe) return;

    const subject = `Recipe: ${this.currentRecipe.title}`;
    let body = `🍽️ ${this.currentRecipe.title}\n\nIngredients:\n`;

    this.currentRecipe.ingredients.forEach(ing => {
      body += `- ${ing}\n`;
    });

    body += `\nSteps:\n`;
    this.currentRecipe.steps.forEach((step, i) => {
      body += `${i + 1}. ${step.instruction}\n`;
    });

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  },



      
      
};