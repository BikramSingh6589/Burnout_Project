const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001/api';

type ApiOptions = RequestInit & {
  token?: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const apiRequest = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const { token, headers, ...requestOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? 'Request failed');
  }

  return data as T;
};
