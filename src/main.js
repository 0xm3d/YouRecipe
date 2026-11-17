import "./style.css";
import { getRecipes } from "./api.js";

// 1. Select HTML elements
const recipesContainer = document.getElementById("recipes-container");
const recipeCount = document.getElementById("recipe-count");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

// 2. Display recipes
const displayRecipes = (recipes) => {
  recipesContainer.replaceChildren();

  recipes.forEach((recipe) => {
    const card = document.createElement("article");

    card.className =
      "bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition";

    // Image
    const image = document.createElement("img");
    image.src = recipe.image;
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

    // Append elements
    content.append(name, cuisine, difficulty, prepTime);
    card.append(image, content);
    recipesContainer.append(card);
  });

  recipeCount.textContent = recipes.length;
};

// 3. Fetch recipes
const loadRecipes = async () => {
  loading.classList.remove("hidden");
  error.classList.add("hidden");

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

// 4. Start the application
loadRecipes();
