// Utility functions to handle the JWT token
const JWT_KEY = 'admin_jwt';

export function storeToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(JWT_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(JWT_KEY);
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(JWT_KEY);
  }
}