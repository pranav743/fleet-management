import { useState, useCallback, useEffect } from "react";
import type { Driver, PaginationInfo, GetDriversParams } from "@/services/driverService";
import { driverService } from "@/services/driverService";

interface UseDriversResult {
  drivers: Driver[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setParams: (params: GetDriversParams | ((prev: GetDriversParams) => GetDriversParams)) => void;
}

export function useDrivers(initialParams?: GetDriversParams): UseDriversResult {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<GetDriversParams>(initialParams || {});

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await driverService.getDrivers(params);
      setDrivers(response.data.drivers);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch drivers");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return {
    drivers,
    pagination,
    isLoading,
    error,
    refetch: fetchDrivers,
    setParams,
  };
}
