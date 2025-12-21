import api from "@/lib/axios";

export interface Driver {
  _id: string;
  email: string;
  role: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GetDriversResponse {
  status: string;
  results: number;
  pagination: PaginationInfo;
  data: {
    drivers: Driver[];
  };
}

export interface CreateDriverRequest {
  email: string;
  password: string;
}

export interface GetDriversParams {
  page?: number;
  limit?: number;
  email?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export const driverService = {
  async getDrivers(params?: GetDriversParams): Promise<GetDriversResponse> {
    const response = await api.get("/drivers", { params });
    return response.data;
  },

  async createDriver(data: CreateDriverRequest): Promise<{ status: string; message: string; data: { driver: Driver } }> {
    const response = await api.post("/drivers", data);
    return response.data;
  },

  async deleteDriver(id: string): Promise<{ status: string; data: null }> {
    const response = await api.delete(`/drivers/${id}`);
    return response.data;
  },
};
