import "./style.css";
import newRecipeImage from "./assets/new-recipe.jpg";

import { getRecipes, searchRecipes, addRecipe, deleteRecipe } from "./api.js";

import { validateRecipe } from "./validation.js";

// 1. Select HTML elements
const recipesContainer = document.getElementById("recipes-container");
const recipeCount = document.getElementById("recipe-count");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const noResults = document.getElementById("no-results");
const showAllButton = document.getElementById("show-all-button");

// Dialog elements
const addButton = document.getElementById("add-button");
const recipeDialog = document.getElementById("recipe-dialog");
const closeDialogButton = document.getElementById("close-dialog");

// Form elements
const recipeForm = document.getElementById("recipe-form");

const recipeName = document.getElementById("recipe-name");
const recipeCuisine = document.getElementById("recipe-cuisine");
const recipeDifficulty = document.getElementById("recipe-difficulty");
const recipeTime = document.getElementById("recipe-time");

// Validation messages
const nameError = document.getElementById("name-error");
const cuisineError = document.getElementById("cuisine-error");
const difficultyError = document.getElementById("difficulty-error");
const timeError = document.getElementById("time-error");

// Submit and success
const submitButton = document.getElementById("submit-button");
const successMessage = document.getElementById("success-message");

// Retry button
const retryButton = document.getElementById("retry-button");

// 2. Local Storage functions
const getAddedRecipes = () => {
  return JSON.parse(localStorage.getItem("yourecipe-added-recipes") || "[]");
};

const saveAddedRecipes = (recipes) => {
  localStorage.setItem("yourecipe-added-recipes", JSON.stringify(recipes));
};

const getDeletedRecipes = () => {
  return JSON.parse(localStorage.getItem("yourecipe-deleted-recipes") || "[]");
};

const saveDeletedRecipes = (ids) => {
  localStorage.setItem("yourecipe-deleted-recipes", JSON.stringify(ids));
};

// 3. Create a recipe card
const createRecipeCard = (recipe) => {
  const card = document.createElement("article");

  card.className =
    "bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition";

  // Image
  const image = document.createElement("img");

  image.src = recipe.image || newRecipeImage;
  image.alt = recipe.name;
  image.className = "w-full h-48 object-cover";

  // Content container
  const content = document.createElement("div");
  content.className = "p-5";

  // Recipe name
  const name = document.createElement("h3");
  name.textContent = recipe.name;
  name.className = "text-lg font-bold text-primary mb-3";

  // Cuisine
  const cuisine = document.createElement("p");
  cuisine.textContent = `Cuisine : ${recipe.cuisine}`;
  cuisine.className = "text-text text-sm mb-2";

  // Difficulty
  const difficulty = document.createElement("p");
  difficulty.textContent = `Difficulté : ${recipe.difficulty}`;
  difficulty.className = "text-text text-sm mb-2";

  // Preparation time
  const prepTime = document.createElement("p");
  prepTime.textContent = `Préparation : ${recipe.prepTimeMinutes} minutes`;
  prepTime.className = "text-text text-sm";

  // Delete button
  const deleteButton = document.createElement("button");

  deleteButton.textContent = "Supprimer";
  deleteButton.type = "button";
  deleteButton.className =
    "bg-red-600 text-white px-4 py-2 my-auto rounded-lg mt-4 hover:bg-red-700";

  deleteButton.addEventListener("click", async () => {
    const confirmed = confirm(
      `Voulez-vous vraiment supprimer "${recipe.name}" ?`,
    );

    if (!confirmed) return;

    deleteButton.disabled = true;
    deleteButton.textContent = "Suppression...";

    try {
      const addedRecipes = getAddedRecipes();

      // Check whether the recipe was added by the user
      const isAddedRecipe = addedRecipes.some((item) => item.id === recipe.id);

      if (isAddedRecipe) {
        // Remove directly from Local Storage
        const updatedRecipes = addedRecipes.filter(
          (item) => item.id !== recipe.id,
        );

        saveAddedRecipes(updatedRecipes);
      } else {
        // Delete original recipe through Axios
        await deleteRecipe(recipe.id);

        // Remember deleted original recipe
        const deletedRecipes = getDeletedRecipes();

        if (!deletedRecipes.includes(recipe.id)) {
          deletedRecipes.push(recipe.id);
          saveDeletedRecipes(deletedRecipes);
        }
      }

      // Update interface
      card.remove();

      recipeCount.textContent = Number(recipeCount.textContent) - 1;

      successMessage.textContent = "La recette a été supprimée avec succès !";
    } catch (err) {
      console.error("Error deleting recipe:", err);

      successMessage.textContent =
        "Impossible de supprimer cette recette. Veuillez réessayer.";

      deleteButton.disabled = false;
      deleteButton.textContent = "Supprimer";
    }
  });

  content.append(name, cuisine, difficulty, prepTime, deleteButton);
  card.append(image, content);

  return card;
};

// 4. Display recipes
const displayRecipes = (recipes) => {
  recipesContainer.replaceChildren();

  recipes.forEach((recipe) => {
    const card = createRecipeCard(recipe);
    recipesContainer.append(card);
  });

  recipeCount.textContent = recipes.length;
};

// 5. Fetch and display all recipes
const loadRecipes = async () => {
  loading.classList.remove("hidden");
  error.classList.add("hidden");
  noResults.classList.add("hidden");

  try {
    // Get original recipes from API
    const apiRecipes = await getRecipes();

    // Get Local Storage data
    const addedRecipes = getAddedRecipes();
    const deletedRecipes = getDeletedRecipes();

    // Remove deleted original recipes
    const filteredRecipes = apiRecipes.filter(
      (recipe) => !deletedRecipes.includes(recipe.id),
    );

    // Combine added and original recipes
    const allRecipes = [...addedRecipes, ...filteredRecipes];

    displayRecipes(allRecipes);

    if (allRecipes.length === 0) {
      noResults.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Error loading recipes:", err);
    error.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
};

// 6. Search recipes
const handleSearch = async () => {
  const keyword = searchInput.value.trim();

  if (!keyword) {
    loadRecipes();
    return;
  }

  loading.classList.remove("hidden");
  error.classList.add("hidden");
  noResults.classList.add("hidden");

  try {
    // Search original recipes through API
    const apiRecipes = await searchRecipes(keyword);

    // Get Local Storage data
    const addedRecipes = getAddedRecipes();
    const deletedRecipes = getDeletedRecipes();

    // Filter deleted original recipes
    const filteredApiRecipes = apiRecipes.filter(
      (recipe) => !deletedRecipes.includes(recipe.id),
    );

    // Search added recipes locally
    const filteredAddedRecipes = addedRecipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(keyword.toLowerCase()),
    );

    // Combine results
    const allResults = [...filteredAddedRecipes, ...filteredApiRecipes];

    displayRecipes(allResults);

    if (allResults.length === 0) {
      noResults.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Error searching recipes:", err);
    error.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
};

// 7. Display validation errors
const displayErrors = (errors) => {
  nameError.textContent = errors.name || "";
  cuisineError.textContent = errors.cuisine || "";
  difficultyError.textContent = errors.difficulty || "";
  timeError.textContent = errors.time || "";
};

// 8. Search button
searchButton.addEventListener("click", handleSearch);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

// 9. Show all recipes
showAllButton.addEventListener("click", () => {
  searchInput.value = "";
  loadRecipes();
});

// 10. Open dialog
addButton.addEventListener("click", () => {
  successMessage.textContent = "";
  recipeDialog.showModal();
});

// 11. Close dialog
closeDialogButton.addEventListener("click", () => {
  recipeDialog.close();
});

// 12. Handle recipe form submission
recipeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const recipe = {
    name: recipeName.value.trim(),
    cuisine: recipeCuisine.value.trim(),
    difficulty: recipeDifficulty.value,
    prepTimeMinutes: Number(recipeTime.value),
  };

  // Validate recipe
  const errors = validateRecipe(recipe);
  displayErrors(errors);

  if (Object.keys(errors).length > 0) return;

  submitButton.disabled = true;
  submitButton.textContent = "Ajout en cours...";

  try {
    // Send POST request
    const addedRecipe = await addRecipe(recipe);
    // Save new recipe in Local Storage
    const addedRecipes = getAddedRecipes();

    addedRecipes.unshift(addedRecipe);

    saveAddedRecipes(addedRecipes);

    // Clear search
    searchInput.value = "";
    noResults.classList.add("hidden");
    error.classList.add("hidden");

    // Display new recipe
    const newCard = createRecipeCard(addedRecipe);
    recipesContainer.prepend(newCard);

    // Update count
    recipeCount.textContent = Number(recipeCount.textContent) + 1;

    // Reset form
    recipeForm.reset();
    displayErrors({});
    recipeDialog.close();

    successMessage.textContent = "La recette a été ajoutée avec succès !";
  } catch (err) {
    console.error("Error adding recipe:", err);

    successMessage.textContent = "Une erreur est survenue. Veuillez réessayer.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Ajouter";
  }
});

// 13. Retry loading recipes
retryButton.addEventListener("click", () => {
  loadRecipes();
});

// 14. Start application
loadRecipes();
