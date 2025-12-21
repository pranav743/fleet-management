import { signOut } from "next-auth/react";

const BASE_URL = "http://localhost:5000/api/v1";

async function fetchWithAuth(url: string, token: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Handle 304 Not Modified
    if (res.status === 304) {
      throw new Error("Resource not modified. Please refresh the page.");
    }

    // Handle unauthorized
    if (res.status === 401) {
      signOut({ callbackUrl: "/login" });
      throw new Error("Unauthorized. Please login again.");
    }

    // Handle other non-OK responses
    if (!res.ok) {
      let errorMessage = `Request failed with status ${res.status}`;
      
      try {
        const errorData = await res.json();
        // Try multiple possible error message fields
        errorMessage = 
          errorData.message || 
          errorData.error || 
          errorData.msg || 
          (errorData.errors && Array.isArray(errorData.errors) && errorData.errors[0]?.msg) ||
          (errorData.errors && typeof errorData.errors === 'string' && errorData.errors) ||
          errorMessage;
      } catch {
        // If JSON parsing fails, use default message
      }
      
      throw new Error(errorMessage);
    }

    // Parse JSON response
    const data = await res.json();
    
    // Check if response has an error status in the JSON body
    if (data.status === "error" || data.status === "fail") {
      throw new Error(data.message || "An error occurred");
    }

    return data;
  } catch (error) {
    // If it's already an Error object, re-throw it
    if (error instanceof Error) {
      throw error;
    }
    // Handle network errors or other issues
    throw new Error("Network error. Please check your connection and try again.");
  }
}

export const api = {
  vehicles: {
    getAll: (token: string, status?: string) => 
      fetchWithAuth(`/vehicles${status ? `?status=${status}` : ""}`, token),
    getAvailable: (token: string, params?: { startDate?: string; endDate?: string; type?: string; status?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);
      const queryString = queryParams.toString();
      return fetchWithAuth(`/vehicles/available${queryString ? `?${queryString}` : ''}`, token);
    },
    create: (token: string, data: Record<string, unknown>) => 
      fetchWithAuth("/vehicles", token, { method: "POST", body: JSON.stringify(data) }),
    getById: (token: string, id: string) => 
      fetchWithAuth(`/vehicles/${id}`, token),
    update: (token: string, id: string, data: Record<string, unknown>) => 
      fetchWithAuth(`/vehicles/${id}`, token, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (token: string, id: string) => 
      fetchWithAuth(`/vehicles/${id}`, token, { method: "DELETE" }),
    getRegistered: (token: string) => 
      fetchWithAuth("/vehicles/registered", token),
    register: (token: string, vehicleId: string) => 
      fetchWithAuth("/vehicles/register", token, { method: "POST", body: JSON.stringify({ vehicleId }) }),
    return: (token: string) => 
      fetchWithAuth("/vehicles/return", token, { method: "POST" }),
  },
  bookings: {
    create: (token: string, data: { vehicleId: string; startDate: string; endDate: string }) => 
      fetchWithAuth("/bookings", token, { method: "POST", body: JSON.stringify(data) }),
    getMyBookings: (token: string) => 
      fetchWithAuth("/bookings", token),
    cancel: (token: string, id: string) => 
      fetchWithAuth(`/bookings/${id}/cancel`, token, { method: "PATCH" }),
  },
  trips: {
    create: (token: string, data: Record<string, unknown>) => 
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
