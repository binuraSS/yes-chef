export const appComputed = {
    currentRecipe() {
      return this.recipes[this.recipeIndex] || {};
    },
    currentStep() {
      return (this.currentRecipe.steps || [])[this.stepIndex] || {};
    },
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
    cardStyle() {
      return this.dragging ? `transform: translateY(${this.currentY}px);` : '';
    }
  };
  