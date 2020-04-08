import Search from './models/Search';
import Recipe from './models/Recipe';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';

/**
 * Global state of the app
 * - search object
 * - current recipe object
 * - shopping list object 
 * - liked recipes
 */

 const state = {}

 /**
  * SEARCH CONTROLLER
  */

 const controlSearch = async () => {
     // 1) Get query from view
     const query = searchView.getInput();

     if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
        // 4) Search for recipes
        await state.search.getResults();

        // 5) Render results on UI
        clearLoader();
        searchView.renderResults(state.search.result)
        } catch (err) {
            alert('Something wrong with the search...')
        }
     }
 }

 elements.searchForm.addEventListener('click', e => {
     e.preventDefault();
     controlSearch();
 })

 elements.searchResPages.addEventListener('click', e => {
     const btn = e.target.closest('.btn-inline');

     if (btn) {
         const goToPage = parseInt(btn.dataset.goto, 10);
         searchView.clearResults();
         searchView.renderResults(state.search.result, goToPage);
     }
 })

 /**
  * RECIPE CONTROLLER
  */

  const controlRecipe = async () => {
      // Get ID from URL
      const id = window.location.hash.replace('#', '');
      console.log(id);

      if (id) {
        // Prepare UI from changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Create new recipe objects
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate time and servings
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);

        } catch (err) {
            alert('Error processing recipe!')
        }
      }
  }

  ['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));