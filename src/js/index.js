import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

    /**
     * Global state of the app
     * - search object
     * - current recipe object
     * - shopping list object 
     * - liked recipes
     */

    const state = {}

    window.s = state;

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

      if (id) {
        // Prepare UI from changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected recipe
        if (state.recipe) searchView.highlightSelected(id);

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
            recipeView.renderRecipe(
                state.recipe, 
                state.likes.isLiked(id)
            );

        } catch (err) {
            alert('Error processing recipe!')
        }
      }
    }

    ['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


    /**
     * LIST CONTROLLER
     */

    const controlList = () => {
        // Create new list if there isn't one yet
        if (!state.list) state.list = new List();

        // Add each item to the list and UI
        state.recipe.ingredients.forEach(el => {
            const item = state.list.addItem(el.count, el.unit, el.ingredient);
            listView.renderItem(item);
        })
    }

    // Handling delete and update shopping list elements
    elements.shopping.addEventListener('click', e => {
        const id = e.target.closest('.shopping__item').dataset.itemid;

        // Handle the delete button
        if (e.target.matches('.shopping__delete, .shopping__delete *')) {
            state.list.deleteItem(id);
            listView.deleteItem(id);

        // Handle the count update
        } else if (e.target.matches('.shopping__count-value')) {
            const val = parseFloat(e.target.value, 10);
            state.list.updateCount(id, val);
        }
    })    

    /**
     * LIKES CONTROLLER
     */

    // !TESTING
    state.likes = new Likes()
    likesView.toggleLikeMenu(state.likes.getNumLikes);

    const controlLikes = () => {
        if (!state.likes) state.likes = new Likes();
        const currentID = state.recipe.id;

        // User has NOT yet liked the current recipe
        if (!state.likes.isLiked(currentID)) {
            // add like to the state
            const newLike = state.likes.addLike(
                currentID,
                state.recipe.title,
                state.recipe.author,
                state.recipe.img
            )

            // toggle the like button 
            likesView.toggleLikeBtn(true);

            // add like to the UI list
            likesView.renderLike(newLike);

        // User HAS liked the current recipe
        } else {
            // remove like from the state
            state.likes.deleteLike(currentID);

            // toggle the like button 
            likesView.toggleLikeBtn(false);

            // remove like from the UI list
            likesView.deleteLike(currentID);
        }

        likesView.toggleLikeMenu(state.likes.getNumLikes());
    }
    
    // Handling recipe button clicks
    elements.recipe.addEventListener('click', e => {
        if (e.target.matches('.btn-decrease, .btn-decrease *')) {
            if (state.recipe.servings > 1) {
                state.recipe.updateServings('dec');
                recipeView.updateServingsIngredients(state.recipe);
            }
        } else if (e.target.matches('.btn-increase, .btn-increase *')) {
            state.recipe.updateServings('inc');
            recipeView.updateServingsIngredients(state.recipe);
        } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
            controlList();
        } else if (e.target.matches('.recipe__love, .recipe__love *')) {
            controlLikes();
        }
    })