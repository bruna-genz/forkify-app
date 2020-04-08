import Search from './models/Search';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchView';

/**
 * Global state of the app
 * - search object
 * - current recipe object
 * - shopping list object 
 * - liked recipes
 */

 const state = {}

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

         // 4) Search for recipes
         await state.search.getResults();

         // 5) Render results on UI
         clearLoader();
         searchView.renderResults(state.search.result)
     }
 }

 elements.searchForm.addEventListener('click', e => {
     e.preventDefault();
     controlSearch();
 })