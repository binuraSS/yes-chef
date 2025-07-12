// scripts/data.js
export const appData = {
  view: 'home',
  activeTab: 'search',
  searchQuery: '',
  ingredientQuery: '',
  selectedIngredients: [],
  recipes: window.recipesData || [],
  recipeIndex: 0,
  stepIndex: 0,
  checkedIngredients: [],
  touchStartY: 0,
  currentY: 0,
  dragging: false,
  timer: null,
  timerCount: 0,
  timerRunning: false,
  timerPaused: false,
  pastelColors: [
    '#fce4ec', '#f3e5f5', '#e3f2fd', '#e8f5e9',
    '#fff3e0', '#f9fbe7', '#ede7f6', '#fbe9e7'
  ],
  urlToImport: '',
  scrapeLoading: false,
  scrapeError: '',
  shoppingList: [],
showShoppingList: false,
};
