// lib/api-admin.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'; // Environment variable with fallback

async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  // Construct the full URL using the environment variable
  const fullUrl = `${API_BASE_URL}${input}`;

  const response = await fetch(fullUrl, {
    ...init,
    credentials: 'include',
  });

  if (response.status === 401) {
    throw new Error('Authentication failed');
  }

  return response;
}

export default authFetch;