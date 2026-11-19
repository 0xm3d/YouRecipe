import axios from "axios";

const api = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 10000,
});

// Get all recipes
export const getRecipes = async () => {
  const response = await api.get("/recipes", {
    params: { limit: 12 },
  });

  return response.data.recipes;
};

// Search recipes
export const searchRecipes = async (keyword) => {
  const response = await api.get("/recipes/search", {
    params: { q: keyword },
  });

  return response.data.recipes;
};
