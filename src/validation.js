export const validateRecipe = (recipe) => {
  const errors = {};

  // Validate recipe name
  if (recipe.name.length < 3 || recipe.name.length > 60) {
    errors.name = "Le nom doit contenir entre 3 et 60 caractères.";
  }

  // Validate cuisine
  if (!recipe.cuisine.trim()) {
    errors.cuisine = "Veuillez saisir une cuisine.";
  }

  // Validate difficulty
  if (!recipe.difficulty) {
    errors.difficulty = "Veuillez choisir une difficulté.";
  }

  // Validate preparation time
  if (
    !Number.isInteger(recipe.prepTimeMinutes) ||
    recipe.prepTimeMinutes < 1 ||
    recipe.prepTimeMinutes > 300
  ) {
    errors.time = "Le temps doit être entre 1 et 300 minutes.";
  }

  return errors;
};
