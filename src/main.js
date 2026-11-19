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

// 2. Create a recipe card
const createRecipeCard = (recipe) => {
  const card = document.createElement("article");

  card.className =
    "bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition";

  // Image
  const image = document.createElement("img");

  if (recipe.image) {
    image.src = recipe.image;
  } else {
    image.src = newRecipeImage;
  }

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
  cuisine.textContent = `Cuisine: ${recipe.cuisine}`;
  cuisine.className = "text-text text-sm mb-2";

  // Difficulty
  const difficulty = document.createElement("p");
  difficulty.textContent = `Difficulty: ${recipe.difficulty}`;
  difficulty.className = "text-text text-sm mb-2";

  // Preparation time
  const prepTime = document.createElement("p");
  prepTime.textContent = `Preparation: ${recipe.prepTimeMinutes} minutes`;
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

    if (!confirmed) {
      return;
    }

    deleteButton.disabled = true;
    deleteButton.textContent = "Suppression...";

    try {
      await deleteRecipe(recipe.id);

      card.remove();

      recipeCount.textContent = Number(recipeCount.textContent) - 1;

      successMessage.textContent = "La recette a été supprimée avec succès !";

      noResults.classList.add("hidden");
    } catch (err) {
      console.error("Error deleting recipe:", err);

      successMessage.textContent =
        "Impossible de supprimer cette recette. Veuillez réessayer.";

      deleteButton.disabled = false;
      deleteButton.textContent = "Supprimer";
    }
  });

  // Append elements
  content.append(name, cuisine, difficulty, prepTime, deleteButton);
  card.append(image, content);

  return card;
};

// 3. Display recipes
const displayRecipes = (recipes) => {
  recipesContainer.replaceChildren();

  recipes.forEach((recipe) => {
    const card = createRecipeCard(recipe);
    recipesContainer.append(card);
  });

  recipeCount.textContent = recipes.length;
};

// 4. Fetch all recipes
const loadRecipes = async () => {
  loading.classList.remove("hidden");
  error.classList.add("hidden");
  noResults.classList.add("hidden");

  try {
    const recipes = await getRecipes();
    displayRecipes(recipes);
  } catch (err) {
    console.error("Error loading recipes:", err);
    error.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
};

// 5. Search recipes
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
    const recipes = await searchRecipes(keyword);

    if (recipes.length === 0) {
      recipesContainer.replaceChildren();
      recipeCount.textContent = 0;
      noResults.classList.remove("hidden");
      return;
    }

    displayRecipes(recipes);
  } catch (err) {
    console.error("Error searching recipes:", err);
    error.classList.remove("hidden");
  } finally {
    loading.classList.add("hidden");
  }
};

// 6. Display validation errors
const displayErrors = (errors) => {
  nameError.textContent = errors.name || "";
  cuisineError.textContent = errors.cuisine || "";
  difficultyError.textContent = errors.difficulty || "";
  timeError.textContent = errors.time || "";
};

// 7. Search button
searchButton.addEventListener("click", handleSearch);

// Search when pressing Enter
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleSearch();
  }
});

// 8. Show all recipes again
showAllButton.addEventListener("click", () => {
  searchInput.value = "";
  loadRecipes();
});

// 9. Open dialog
addButton.addEventListener("click", () => {
  successMessage.textContent = "";
  recipeDialog.showModal();
});

// 10. Close dialog
closeDialogButton.addEventListener("click", () => {
  recipeDialog.close();
});

// 11. Handle recipe form submission
recipeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Collect form values
  const recipe = {
    name: recipeName.value.trim(),
    cuisine: recipeCuisine.value.trim(),
    difficulty: recipeDifficulty.value,
    prepTimeMinutes: Number(recipeTime.value),
  };

  // Validate recipe
  const errors = validateRecipe(recipe);
  displayErrors(errors);

  // Stop if there are validation errors
  if (Object.keys(errors).length > 0) {
    return;
  }

  // Disable submit button
  submitButton.disabled = true;
  submitButton.textContent = "Ajout en cours...";

  try {
    // Send recipe to API
    const addedRecipe = await addRecipe(recipe);

    console.log("Recipe added:", addedRecipe);

    // Clear search and show all recipes
    searchInput.value = "";
    noResults.classList.add("hidden");
    error.classList.add("hidden");

    // Create and display new recipe card
    const newCard = createRecipeCard(addedRecipe);
    recipesContainer.prepend(newCard);

    // Update recipe count
    recipeCount.textContent = Number(recipeCount.textContent) + 1;

    // Reset form and close dialog
    recipeForm.reset();
    displayErrors({});
    recipeDialog.close();

    // Show success message
    successMessage.textContent = "La recette a été ajoutée avec succès !";
  } catch (err) {
    console.error("Error adding recipe:", err);

    successMessage.textContent = "Une erreur est survenue. Veuillez réessayer.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Ajouter";
  }
});

// 12. Retry loading recipes
retryButton.addEventListener("click", () => {
  loadRecipes();
});

// 13. Start application
loadRecipes();
