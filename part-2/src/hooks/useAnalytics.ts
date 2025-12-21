import { useState, useEffect, useCallback } from "react";
import {
  getDashboardStats,
  getTopOwners,
  getTopVehicles,
  getTopCustomers,
} from "@/services/analyticsService";

import type {
  DashboardStats,
  TopOwner,
  TopVehicle,
  TopCustomer,
} from "@/services/analyticsService";

interface UseAnalyticsReturn {
  stats: DashboardStats | null;
  topOwners: TopOwner[];
  topVehicles: TopVehicle[];
  topCustomers: TopCustomer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAnalytics = (limit: number = 5): UseAnalyticsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topOwners, setTopOwners] = useState<TopOwner[]>([]);
  const [topVehicles, setTopVehicles] = useState<TopVehicle[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsData, ownersData, vehiclesData, customersData] =
        await Promise.allSettled([
          getDashboardStats(),
          getTopOwners(limit),
          getTopVehicles(limit),
          getTopCustomers(limit),
        ]);

      if (statsData.status === "fulfilled") {
        setStats(statsData.value);
      }

      if (ownersData.status === "fulfilled") {
        setTopOwners(ownersData.value);
      }

      if (vehiclesData.status === "fulfilled") {
        setTopVehicles(vehiclesData.value);
      }

      if (customersData.status === "fulfilled") {
        setTopCustomers(customersData.value);
      }

      const hasError = [
        statsData,
        ownersData,
        vehiclesData,
        customersData,
      ].some((result) => result.status === "rejected");

      if (hasError) {
        setError(
          "Some analytics data could not be loaded. Displaying available data."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch analytics data"
      );
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    stats,
    topOwners,
    topVehicles,
    topCustomers,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};
