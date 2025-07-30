import axios from "axios";

export async function getRecommendations(userId) {
  const { data } = await axios.get(
    `http://localhost:5000/recommendations/${userId}`
  );
  return data; 
}

// Sends a GET request to the Flask ML microservice running on port 5000.
// The service endpoint /recommendations/:userId returns raw recommendation data.
