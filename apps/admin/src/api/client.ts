const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export async function adminRequest<T>(
  path: string,
  credentials: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers);

  headers.set('Authorization', `Basic ${credentials}`);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(payload?.message ?? 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
