import axios from "axios";

export async function refreshToken(token: string): Promise<string | null> {
  if (!token) {
    return null;
  }

  const response = await axios.post("/api/subscription/refresh", {
    token,
  });

  const newToken = response.data.token;

  if (newToken) {
    return newToken;
  }

  return null;
}