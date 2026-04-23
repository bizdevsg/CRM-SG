const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiFetch(path, options = {}) {
  const { token, body, headers, ...restOptions } = options;
  const isFormData = body instanceof FormData;
  const requestHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers
  };

  if (body && !isFormData && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: requestHeaders,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada server.");
  }

  return data;
}
