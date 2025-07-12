const app = new Vue({
  el: '#app',

  // ===== DATA PROPERTIES =====
  data: {
    // View Management
    view: 'home', // 'home', 'ingredients', 'recipe'
    activeTab: 'search', // 'search' or 'ingredientSearch'

    // Search & Filtering
    searchQuery: '',
    ingredientQuery: '',
    selectedIngredients: [],

    // Recipe & Step Management
    recipes: window.recipesData || [],
    recipeIndex: 0,
    stepIndex: 0,
    checkedIngredients: [],

    // Touch & Swipe Controls
    touchStartY: 0,
    currentY: 0,
    dragging: false,

    // Timer Management
    timer: null,
    timerCount: 0,
    timerRunning: false,
    timerPaused: false,

    // UI Configuration
    pastelColors: [
      '#fce4ec', '#f3e5f5', '#e3f2fd', '#e8f5e9',
      '#fff3e0', '#f9fbe7', '#ede7f6', '#fbe9e7'
    ],

    urlToImport: '',
scrapeLoading: false,
scrapeError: '',

  },

  // ===== COMPUTED PROPERTIES =====
  computed: {
    // Recipe & Step Getters
    currentRecipe() {
      return this.recipes[this.recipeIndex] || {};
    },
    currentStep() {
      return (this.currentRecipe.steps || [])[this.stepIndex] || {};
    },

    // Search & Filter Results
    filteredRecipes() {
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) return [];
      
      return this.recipes.filter(recipe => 
        recipe.title.toLowerCase().includes(query)
      );
    },
    matchingRecipes() {
      if (this.selectedIngredients.length === 0) return [];
      
      return this.recipes.filter(recipe => {
        if (!recipe.ingredients) return false;
        
        return this.selectedIngredients.every(selectedIngredient =>
          recipe.ingredients.some(recipeIngredient =>
            recipeIngredient.toLowerCase().includes(selectedIngredient.toLowerCase())
          )
        );
      });
    },

    // Timer Display
    formattedTimer() {
      const minutes = Math.floor(this.timerCount / 60);
      const seconds = this.timerCount % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    timerCircleStyle() {
      if (!this.currentStep.timer) return {};
      
      const total = this.currentStep.timer;
      const percent = this.timerCount / total;
      const circumference = 2 * Math.PI * 45;
      const offset = circumference * (1 - percent);
      
      return {
        'stroke-dasharray': `${circumference}`,
        'stroke-dashoffset': offset
      };
    },

    // UI Styles
    cardStyle() {
      return this.dragging ? `transform: translateY(${this.currentY}px);` : '';
    }
  },

  // ===== METHODS =====
  methods: {
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
    scrapeFromUrl() {
      this.scrapeLoading = true;
      this.scrapeError = '';
    
      fetch('http://localhost:5000/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: this.urlToImport }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            this.scrapeError = data.error;
          } else {
            const newRecipe = {
  title: data.title,
  ingredients: data.ingredients,
  steps: data.instructions.map(instruction => ({ instruction })),
};

this.recipes.push(newRecipe);
this.recipeIndex = this.recipes.length - 1;
this.stepIndex = 0;
this.checkedIngredients = [];
this.view = 'ingredients';


          }
        })
        .catch(() => {
          this.scrapeError = 'Something went wrong. Please try another URL.';
        })
        .finally(() => {
          this.scrapeLoading = false;
        });
    },
    getEmoji(text) {
      const lower = text.toLowerCase();
      if (lower.includes("bake")) return "🔥";
      if (lower.includes("mix")) return "🥣";
      if (lower.includes("chop") || lower.includes("slice")) return "🔪";
      if (lower.includes("boil")) return "🍲";
      if (lower.includes("serve")) return "🍽️";
      if (lower.includes("stir")) return "🥄";
      if (lower.includes("heat")) return "🌡️";
      if (lower.includes("grill")) return "🍖";
      if (lower.includes("wait") || lower.includes("rest")) return "⏳";
      return "👨‍🍳";
    },

     emailFullRecipe() {
    const recipe = this.currentRecipe;

    if (!recipe) return;

    let body = `🍽️ ${recipe.title}\n\nIngredients:\n`;
    recipe.ingredients.forEach(item => {
      body += `- ${item}\n`;
    });

    body += `\nSteps:\n`;
    recipe.steps.forEach((step, i) => {
      body += `${i + 1}. ${step.instruction}\n`;
    });

    const subject = `Recipe: ${recipe.title}`;
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
  },

    
    
  },

  // ===== LIFECYCLE HOOKS =====
  mounted() {
    window.addEventListener('keydown', this.handleKeyDown);
  },

  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    this.resetTimer();
  }
});
