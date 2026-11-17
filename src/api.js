import axios from "axios";

const api = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 10000,
});

export const getRecipes = async () => {
  const response = await api.get("/recipes", {
    params: { limit: 12 },
  });

  return response.data.recipes;
};
