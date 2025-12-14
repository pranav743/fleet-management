const BASE_URL = "http://localhost:5000/api/v1";

async function fetchWithAuth(url: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  vehicles: {
    getAll: (token: string, status?: string) => 
      fetchWithAuth(`/vehicles${status ? `?status=${status}` : ""}`, token),
    create: (token: string, data: any) => 
      fetchWithAuth("/vehicles", token, { method: "POST", body: JSON.stringify(data) }),
    getById: (token: string, id: string) => 
      fetchWithAuth(`/vehicles/${id}`, token),
    update: (token: string, id: string, data: any) => 
      fetchWithAuth(`/vehicles/${id}`, token, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (token: string, id: string) => 
      fetchWithAuth(`/vehicles/${id}`, token, { method: "DELETE" }),
  },
  bookings: {
    create: (token: string, data: any) => 
      fetchWithAuth("/bookings", token, { method: "POST", body: JSON.stringify(data) }),
    getMyBookings: (token: string) => 
      fetchWithAuth("/bookings", token),
  },
  trips: {
    create: (token: string, data: any) => 
      fetchWithAuth("/trips", token, { method: "POST", body: JSON.stringify(data) }),
    getAssigned: (token: string) => 
      fetchWithAuth("/trips", token),
    updateStatus: (token: string, id: string, status: string) => 
      fetchWithAuth(`/trips/${id}`, token, { method: "PATCH", body: JSON.stringify({ status }) }),
  },
  analytics: {
    getDashboard: (token: string) => 
      fetchWithAuth("/analytics/dashboard", token),
  }
};
