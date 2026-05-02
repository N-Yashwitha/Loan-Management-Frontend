const API_BASE_URL = "https://loan-management-backend-k5kj.onrender.com/api";

async function handleResponse(response) {

  const data =
      await response.json().catch(() => ({}));

  if (!response.ok) {

    throw new Error(
        data.message || "Something went wrong"
    );
  }

  return data;
}

export async function apiFetch(
        path,
        options = {}
) {

  // Get token from localStorage
  const token =
      localStorage.getItem("token");

  const response =
      await fetch(`${API_BASE_URL}${path}`, {

    headers: {

      "Content-Type": "application/json",

      // Send JWT token
      Authorization:
          token
            ? `Bearer ${token}`
            : "",

      ...(options.headers || {})
    },

    ...options
  });

  return handleResponse(response);
}

export { API_BASE_URL };