import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5299/api",
});

export default api;