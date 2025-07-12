export function scrapeFromUrl() {
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
  }
  