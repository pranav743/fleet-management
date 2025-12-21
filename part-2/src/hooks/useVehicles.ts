import { useState, useCallback, useEffect } from "react";
import type { Vehicle, TopVehicle, PaginationInfo, GetVehiclesParams, GetTopVehiclesParams } from "@/services/vehicleService";
import { vehicleService } from "@/services/vehicleService";

interface UseVehiclesResult {
  vehicles: Vehicle[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setParams: (params: GetVehiclesParams | ((prev: GetVehiclesParams) => GetVehiclesParams)) => void;
}

interface UseTopVehiclesResult {
  vehicles: TopVehicle[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setParams: (params: GetTopVehiclesParams | ((prev: GetTopVehiclesParams) => GetTopVehiclesParams)) => void;
}

export function useVehicles(initialParams?: GetVehiclesParams): UseVehiclesResult {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<GetVehiclesParams>(initialParams || {});

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vehicleService.getVehicles(params);
      setVehicles(response.data.vehicles);
      setPagination(response.pagination);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch vehicles");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    pagination,
    isLoading,
    error,
    refetch: fetchVehicles,
    setParams,
  };
}

export function useTopVehicles(initialParams?: GetTopVehiclesParams): UseTopVehiclesResult {
  const [vehicles, setVehicles] = useState<TopVehicle[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<GetTopVehiclesParams>(initialParams || {});

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vehicleService.getTopVehicles(params);
      setVehicles(response.data.vehicles);
      setPagination(response.pagination);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch top vehicles");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    pagination,
    isLoading,
    error,
    refetch: fetchVehicles,
    setParams,
  };
}
